require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");

const consumer_key = process.env.TICKETMASTER_CONSUMER_KEY;
const consumer_secret = process.env.TICKETMASTER_CONSUMER_SECRET;

router.get("/events", async (req, res) => {
  const artist_name = req.query.artistName;
  if (!artist_name) {
    return res.status(400).send("Missing artist_name query parameter");
  }

  const api_url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${artist_name}&apikey=${consumer_key}`;

  try {
    const response = await axios.get(api_url);
    res.json(response.data);
  } catch (error) {
    console.error("Error calling Ticketmaster API", error.message);
    res.status(500).send("Error calling Ticketmaster API");
  }
});

module.exports = router;
