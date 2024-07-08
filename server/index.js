require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

const util_controller = require("./controllers/util");
const spotify_controller = require("./controllers/spotify");
const ticketmaster_controller = require("./controllers/ticketmaster");
const google_controller = require("./controllers/google");

app
  .use(express.static(path.join(__dirname, "../client/dist/")))
  .use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  )
  .use(express.json())
  .use(cookieParser())
  .use("/util", util_controller)
  .use("/api/spotify", spotify_controller)
  .use("/api/ticketmaster", ticketmaster_controller)
  .use("/api/google", google_controller)
  .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
