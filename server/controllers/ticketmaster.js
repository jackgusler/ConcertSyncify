require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const cache = require("../cache");

const consumer_key = process.env.TICKETMASTER_CONSUMER_KEY;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, retries = 3, delayTime = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && i < retries - 1) {
        await delay(delayTime);
        delayTime *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
};

router.get("/events", async (req, res) => {
  const keyword = req.query.keyword;
  const sort = req.query.sort; // Get sort parameter from query
  const geoHash = req.query.geoHash; // Get geoHash from query

  if (!keyword) {
    return res.status(400).send("Missing keyword query parameter");
  }

  let api_url = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${keyword}&apikey=${consumer_key}`;

  // Check if sort parameter is provided and is either 'date,asc' or 'distance,asc'
  if (sort && (sort === 'date,asc' || sort === 'distance,asc')) {
    api_url += `&sort=${sort}`; // Append sort parameter to API URL
  }

  // Append geoPoint parameter if geoHash is provided
  if (geoHash) {
    api_url += `&geoPoint=${geoHash}`;
  }

  const cacheKey = `ticketmaster:events:${keyword}:${sort || 'default'}:${geoHash || 'default'}`; // Include sort and geoHash in cache key

  try {
    // Try to fetch data from NodeCache cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
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
