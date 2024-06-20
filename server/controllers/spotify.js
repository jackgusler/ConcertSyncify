require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/top-artists", async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/me/top/artists",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
