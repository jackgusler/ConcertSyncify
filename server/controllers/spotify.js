require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");
const cache = require("../cache");

const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const client_url = process.env.CLIENT_URL;

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email user-top-read";
  const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}`;
  res.redirect(auth_url);
});

router.get("/callback", async (req, res) => {
  const auth_options = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: req.query.code,
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
    cache.set("spotify_tokens", { access_token, refresh_token }, 3600);
    res.redirect(`${client_url}/dashboard`);
  } catch (error) {
    console.error("Error during callback:", error);
    res.redirect(`${client_url}/error`);
  }
});

router.get("/logout", (req, res) => {
  cache.del("spotify_tokens");
  res.json({ redirectUrl: "/" });
});

router.get("/logged-in", async (req, res) => {
  const tokens = cache.get("spotify_tokens");
  const access_token = tokens ? tokens.access_token : null;
  if (!access_token) {
    return res.json({ logged_in: false });
  }

  try {
    await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    res.json({ logged_in: true });
  } catch (error) {
    res.json({ logged_in: false });
  }
});

router.get("/top-artists", async (req, res) => {
  const tokens = cache.get("spotify_tokens");
  const access_token = tokens ? tokens.access_token : null;
  if (!access_token) {
    return res.status(401).send("Unauthorized");
  }

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
    res.status(500).send(error.message);
  }
});

router.get("/top-genres", async (req, res) => {
  const tokens = cache.get("spotify_tokens");
  const access_token = tokens ? tokens.access_token : null;
  if (!access_token) {
    return res.status(401).send("Unauthorized");
  }

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
    console.error("Error fetching top genres:", error);
    res.status(500).send(error.message);
  }
});

router.get("/search", async (req, res) => {
  let { q, type = "artist" } = req.query;
  if (!q) {
    return res.status(400).send("Missing query parameter 'q'");
  }
  let isGenreSearch = false;
  if (type === "genre") {
    q = `genre:"${q}"`;
    isGenreSearch = true;
  }

  const tokens = cache.get("spotify_tokens");
  const access_token = tokens ? tokens.access_token : null;
  if (!access_token) {
    return res.status(401).send("Unauthorized");
  }

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
