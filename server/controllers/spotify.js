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
    const redirect_url = `http://localhost:5173/stats?access_token=${access_token}&refresh_token=${refresh_token}`;
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

module.exports = router;
