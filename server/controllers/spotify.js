require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const cache = require("../cache");

const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const client_url = process.env.CLIENT_URL;
const jwt_secret = process.env.JWT_SECRET; // Add a secret for JWT

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email user-top-read";
  const state = jwt.sign({}, jwt_secret, { expiresIn: "15m" }); // Generate a JWT as the state parameter
  res.cookie("spotify_auth_state", state);

  const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`;
  res.redirect(auth_url);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies["spotify_auth_state"] : null;

  try {
    jwt.verify(state, jwt_secret);
  } catch (err) {
    res.redirect(`${client_url}/error?error=state_mismatch`);
    return;
  }

  if (state === null || state !== storedState) {
    res.redirect(`${client_url}/error?error=state_mismatch`);
    return;
  }

  res.clearCookie("spotify_auth_state");

  const auth_options = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  try {
    const response = await axios.post(
      auth_options.url,
      querystring.stringify(auth_options.form),
      { headers: auth_options.headers }
    );
    const { access_token, refresh_token } = response.data;

    // Generate JWT containing access and refresh tokens
    const token = jwt.sign({ access_token, refresh_token }, jwt_secret, {
      expiresIn: "1h",
    });

    res.redirect(`${client_url}/dashboard?token=${token}`);
  } catch (error) {
    console.error("Error during callback:", error);
    res.redirect(`${client_url}/error`);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("spotify_auth_state");
  res.json({ redirectUrl: "/" });
});

// Middleware to extract token from query or headers
const extractToken = (req, res, next) => {
  const token = req.query.token || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    req.user = jwt.verify(token, jwt_secret);
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
};

router.get("/top-artists", extractToken, async (req, res) => {
  const access_token = req.user.access_token;
  const refresh_token = req.user.refresh_token;

  const cacheKey = `spotify:top-artists:${access_token}`;

  try {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    cache.set(cacheKey, response.data, 3600);

    res.json(response.data);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const newAccessToken = await refreshAccessToken(refresh_token);
      const newToken = jwt.sign(
        { access_token: newAccessToken, refresh_token },
        jwt_secret,
        { expiresIn: "1h" }
      );

      res.redirect(`${client_url}/dashboard?token=${newToken}`);
    } else {
      res.status(500).send(error.message);
    }
  }
});

router.get("/top-genres", extractToken, async (req, res) => {
  const access_token = req.user.access_token;
  const refresh_token = req.user.refresh_token;

  const topGenresCacheKey = `spotify:top-genres:${access_token}`;

  try {
    let cachedTopGenres = await cache.get(topGenresCacheKey);
    if (cachedTopGenres) {
      return res.json({ genres: cachedTopGenres });
    }

    const cacheKey = `spotify:top-artists:${access_token}`;
    let topArtistsData = await cache.get(cacheKey);
    if (!topArtistsData) {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      topArtistsData = response.data;
      cache.set(cacheKey, topArtistsData, 3600);
    }

    let genres = new Set();
    topArtistsData.items.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genres.add(genre);
      });
    });

    let searchPromises = Array.from(genres).map((genre) =>
      axios
        .get(`https://api.spotify.com/v1/search`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          params: {
            q: `genre:"${genre}"`,
            type: "artist",
            limit: 1,
          },
        })
        .then((response) => ({ genre, artist: response.data.artists.items[0] }))
        .catch((error) => {
          console.error(`Error searching for genre ${genre}:`, error);
          return { genre, artist: null };
        })
    );

    let results = await Promise.all(searchPromises);
    let genreArtistMap = results.filter(({ artist }) => artist !== null);
    let top10Genres = genreArtistMap.slice(0, 10);

    cache.set(topGenresCacheKey, top10Genres, 3600);

    res.json({ genres: top10Genres });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const newAccessToken = await refreshAccessToken(refresh_token);
      const newToken = jwt.sign(
        { access_token: newAccessToken, refresh_token },
        jwt_secret,
        { expiresIn: "1h" }
      );

      res.redirect(`${client_url}/dashboard?token=${newToken}`);
    } else {
      console.error("Error fetching top genres:", error);
      res.status(500).send(error.message);
    }
  }
});

router.get("/search", extractToken, async (req, res) => {
  let { q, type = "artist" } = req.query;

  if (!q) {
    return res.status(400).send("Missing query parameter 'q'");
  }

  let isGenreSearch = false;
  if (type === "genre") {
    q = `genre:"${q}"`;
    isGenreSearch = true;
  }

  const access_token = req.user.access_token;

  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        q,
        type: "artist",
        limit: 10,
      },
    });

    if (isGenreSearch) {
      const genresMap = new Map();
      response.data.artists.items.forEach((artist) => {
        artist.genres.forEach((genre) => {
          if (!genresMap.has(genre)) {
            genresMap.set(genre, {
              genre: genre,
              artist: artist,
            });
          }
        });
      });
      const genresArray = Array.from(genresMap.values());
      res.json(genresArray);
    } else {
      const items = response.data.artists ? response.data.artists.items : [];
      res.json(items.slice(0, 10));
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

const refreshAccessToken = async (refresh_token) => {
  const auth_options = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axios.post(
      auth_options.url,
      querystring.stringify(auth_options.form),
      { headers: auth_options.headers }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Unable to refresh access token");
  }
};
