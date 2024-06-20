const express = require("express");
const router = express.Router();
const { getAll, getById } = require("../models/concerts");

router.get("/", (req, res) => {
  res.json(getAll());
});

router.get("/:id", (req, res) => {
  const concert = getById(parseInt(req.params.id));
  if (!concert) {
    res.status(404).send("Concert not found");
  } else {
    res.json(concert);
  }
});

module.exports = router;
