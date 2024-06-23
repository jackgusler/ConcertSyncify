require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");
const querystring = require("querystring");

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
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/top-genres", async (req, res) => {
  const access_token = req.headers.authorization.split(" ")[1];
  try {
    // Step 1: Get the User's Top Artists
    const topArtistsResponse = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Step 2: Extract Genres
    let genres = new Set();
    topArtistsResponse.data.items.forEach((artist) => {
      artist.genres.forEach((genre) => {
        genres.add(genre);
      });
    });

    // Step 3: Search for Artists by Genre and Extract First Artist's Image in Parallel
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
        .then((response) => ({ genre, response }))
        .catch((error) => {
          console.error(`Error searching for genre ${genre}:`, error);
          return { genre, response: null }; // Handle errors gracefully
        })
    );

    // Wait for all search requests to complete
    let results = await Promise.all(searchPromises);

    // Process results
    let genreImageMap = {};
    results.forEach(({ genre, response }) => {
      if (response && response.data.artists.items.length > 0) {
        const artist = response.data.artists.items[0];
        if (artist.images.length > 0) {
          genreImageMap[genre] = artist.images[0].url;
        }
      }
    });

    // Step 4: Prepare the Response Data
    const topGenres = Object.keys(genreImageMap)
      .map((genre) => ({
        genre: genre,
        image: genreImageMap[genre],
      }))
      .slice(0, 10); // Limit to top 10 genres

    res.json({ topGenres });
  } catch (error) {
    console.error("Error fetching top genres:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
