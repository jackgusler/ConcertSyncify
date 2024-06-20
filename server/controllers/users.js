require("dotenv").config();
const express = require("express");
const router = express.Router();
const { login, logout, callback } = require("../models/users");

router.get("/login", (req, res) => {
  res.redirect(login());
});

router.post("/logout", (req, res) => {
  logout();
});

router.get("/callback", async (req, res) => {
  res.redirect(await callback(req.query.code));
});

module.exports = router;
