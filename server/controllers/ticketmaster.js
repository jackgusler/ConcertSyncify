require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const cache = require("../cache");

const consumer_key = process.env.TICKETMASTER_CONSUMER_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, retries = 3, delayTime = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && i < retries - 1) {
        console.warn(`Rate limited, retrying after ${delayTime}ms...`);
        await delay(delayTime);
        delayTime *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
};

router.get("/events", async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).send("Missing keyword query parameter");
  }

  const cacheKey = `ticketmaster:events:${keyword}`;
  const api_url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${keyword}&apikey=${consumer_key}`;

  try {
    // Try to fetch data from NodeCache cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return res.json(cachedData)
    }

    // If not in cache, fetch from API
    const response = await fetchWithRetry(api_url);

    // Cache the API response in NodeCache and set an expiration (e.g., 1 hour)
    cache.set(cacheKey, response.data, 3600);

    res.json(response.data);
  } catch (error) {
    console.error("Error calling Ticketmaster API", error.message);
    res.status(500).send("Error calling Ticketmaster API");
  }
});

module.exports = router;