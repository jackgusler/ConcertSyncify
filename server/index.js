// server/index.js
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

const spotifyController = require("./controllers/spotify");

app
  .use(cors())
  .use(express.json())
  .use("/api/spotify", spotifyController);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
