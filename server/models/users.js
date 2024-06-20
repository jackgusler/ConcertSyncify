require("dotenv").config();
const axios = require("axios");
const querystring = require("querystring");

const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

module.exports = {
  login: () => {
    const scope = "user-read-private user-read-email user-top-read";

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}`;

    return authUrl;
  },

  logout: () => {
    // Clear the access token and refresh token from the session
    req.session.access_token = null;
    req.session.refresh_token = null;
    res.redirect("/");
  },

  callback: async (code) => {
    const authOptions = {
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
        authOptions.url,
        querystring.stringify(authOptions.form),
        { headers: authOptions.headers }
      );
      const { access_token, refresh_token } = response.data;
      const redirectUrl = `http://localhost:5173?access_token=${access_token}&refresh_token=${refresh_token}`;
      return redirectUrl;
    } catch (error) {
      const redirectUrl = `http://localhost:5173/#/error/invalid_token`;
      return redirectUrl;
    }
  },
};
