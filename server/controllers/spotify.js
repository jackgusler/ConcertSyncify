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

// Utility function to refresh Spotify access token
const refreshSpotifyToken = async () => {
  const tokens = cache.get("spotify_tokens");
  const refresh_token = tokens ? tokens.refresh_token : null;

  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  const refresh_options = {
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
      refresh_options.url,
      querystring.stringify(refresh_options.form),
      { headers: refresh_options.headers }
    );
    const { access_token } = response.data;
    tokens.access_token = access_token;
    cache.set("spotify_tokens", tokens, 3600);
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Failed to refresh Spotify token");
  }
};

// Wrapper function to make Spotify API calls with token refresh handling
const makeSpotifyApiCall = async (url, params = {}) => {
  let tokens = cache.get("spotify_tokens");
  let access_token = tokens ? tokens.access_token : null;

  if (!access_token) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: params,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token might be expired, refresh it
      access_token = await refreshSpotifyToken();
      const retryResponse = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: params,
      });
      return retryResponse.data;
    } else {
      throw error;
    }
  }
};

// Example usage in your routes
router.get("/top-artists", async (req, res) => {
  try {
    const data = await makeSpotifyApiCall(
      "https://api.spotify.com/v1/me/top/artists"
    );
    res.json(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/top-genres", async (req, res) => {
  try {
    const data = await makeSpotifyApiCall(
      "https://api.spotify.com/v1/me/top/artists"
    );
    let genres = new Set();
    data.items.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genres.add(genre);
      });
    });

    let searchPromises = Array.from(genres).map((genre) =>
      makeSpotifyApiCall(`https://api.spotify.com/v1/search`, {
        q: `genre:"${genre}"`,
        type: "artist",
        limit: 1,
      }).then((response) => ({ genre, artist: response.artists.items[0] }))
    );

    let results = await Promise.all(searchPromises);
    let genreArtistMap = results.filter(({ artist }) => artist !== null);
    let top10Genres = genreArtistMap.slice(0, 10);

    res.json({ genres: top10Genres });
  } catch (error) {
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

  try {
    const response = await makeSpotifyApiCall(
      "https://api.spotify.com/v1/search",
      {
        q,
        type: "artist",
        limit: 10,
      }
    );

    if (isGenreSearch) {
      const genresMap = new Map();
      response.artists.items.forEach((artist) => {
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
      const items = response.artists ? response.artists.items : [];
      res.json(items.slice(0, 10));
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
