const express = require("express");
const router = express.Router();
const cache = require("../cache");

router.get("/get-cache", async (req, res) => {
  const key = req.query.key;
  try {
    const value = cache.get(key);
    if (!value) {
      return res.status(404).send("Cache not found");
    }
    res.json(value);
  } catch (error) {
    console.error("Error getting cache", error.message);
    res.status(500).send("Error getting cache");
  }
});

router.post("/set-cache", async (req, res) => {
  const { key, value } = req.body;
  try {
    if (typeof key !== 'string' && typeof key !== 'number') {
      throw new Error('The key argument has to be of type `string` or `number`.');
    }
    cache.set(key, value);
    res.send("Cache set successfully");
  } catch (error) {
    console.error("Error setting cache", error.message);
    res.status(500).send("Error setting cache");
  }
});

module.exports = router;