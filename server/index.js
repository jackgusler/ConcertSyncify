// server/index.js
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

const spotify_controller = require("./controllers/spotify");
const ticketmaster_controller = require("./controllers/ticketmaster");

app
  .use(cors())
  .use(express.json())
  .use("/api/spotify", spotify_controller)
  .use("/api/ticketmaster", ticketmaster_controller);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
