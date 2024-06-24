require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");
const cache = require("../cache");

const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email user-top-read";

  const auth_url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}`;

  res.redirect(auth_url);
});

router.get("/logged-in", async (req, res) => {
  const access_token = req.headers.authorization.split(" ")[1];
  try {
    // Use the access token to get the user's profile info
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
    const redirect_url = `http://localhost:5173/dashboard?access_token=${access_token}&refresh_token=${refresh_token}`;
    res.redirect(redirect_url);
  } catch (error) {
    const redirect_url = `http://localhost:5173/error`;
    res.redirect(redirect_url);
    return redirect_url;
  }
});

router.get("/top-artists", async (req, res) => {
  const access_token = req.headers.authorization.split(" ")[1];
  if (!access_token) {
    return res.status(401).send("Unauthorized");
  }

  const cacheKey = `spotify:top-artists:${access_token}`;

  try {
    // Check if the data is already cached
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log("Returning cached data for top artists");
      return res.json(cachedData);
    }

    // If not cached, fetch the top artists from Spotify API
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Cache the fetched data with an expiration (e.g., 1 hour)
    cache.set(cacheKey, response.data, 3600);

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching top artists:", error.message);
    res.status(500).send(error.message);
  }
});

router.get("/top-genres", async (req, res) => {
  const access_token = req.headers.authorization.split(" ")[1];
  if (!access_token) {
    return res.status(401).send("Unauthorized");
  }

  const topGenresCacheKey = `spotify:top-genres:${access_token}`;

  try {
    // Check if the top genres data is already cached
    let cachedTopGenres = await cache.get(topGenresCacheKey);
    if (cachedTopGenres) {
      console.log("Returning cached data for top genres");
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
      // Optionally cache this data if you want to cache it here as well
      console.log("Caching top artists data inside top-genres endpoint");
      cache.set(cacheKey, topArtistsData, 3600);
    }

    // Extract Genres
    let genres = new Set();
    topArtistsData.items.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genres.add(genre);
      });
    });

    // Search for Artists by Genre and Extract First Artist in Parallel
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

    // Cache the top genres data
    cache.set(topGenresCacheKey, top10Genres, 3600); // Adjust the expiration as needed

    res.json({ genres: top10Genres });
  } catch (error) {
    console.error("Error fetching top genres:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
