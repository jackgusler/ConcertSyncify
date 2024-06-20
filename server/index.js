// server/index.js
const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const concertController = require("./controllers/concerts");

app.use(cors()).use(express.json()).use("/concerts", concertController);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
