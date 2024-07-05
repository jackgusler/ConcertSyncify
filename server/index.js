require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const util_controller = require("./controllers/util");
const spotify_controller = require("./controllers/spotify");
const ticketmaster_controller = require("./controllers/ticketmaster");
const google_controller = require("./controllers/google");

app
  .use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  )
  .use(express.json())
  .use("/util", util_controller)
  .use("/api/spotify", spotify_controller)
  .use("/api/ticketmaster", ticketmaster_controller)
  .use("/api/google", google_controller);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
