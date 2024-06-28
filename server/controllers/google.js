require("dotenv").config();

const express = require("express");
const router = express.Router();
const cache = require("../cache");
const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

router.get("/login", (req, res) => {
  const auth_url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(auth_url);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    cache.set("google_tokens", tokens, 3600);
    res.redirect("http://localhost:5173/dashboard");
  } catch (error) {
    res.redirect("http://localhost:5173/error");
  }
});

router.get("/logout", (req, res) => {
  cache.del("google_tokens");
  res.json({ redirectUrl: "/dashboard" });
});

router.get("/logged-in", async (req, res) => {
  const tokens = cache.get("google_tokens");
  if (!tokens) {
    return res.json({ logged_in: false });
  }

  oauth2Client.setCredentials(tokens);

  try {
    await oauth2Client.getAccessToken();
    res.json({ logged_in: true });
  } catch (error) {
    res.json({ logged_in: false });
  }
});

router.get("/events", async (req, res) => {
  const tokens = cache.get("google_tokens");
  if (!tokens) {
    return res.status(401).send("Unauthorized");
  }

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching events: " + error.message);
  }
});

router.post("/create-event", async (req, res) => {
  const { summary, description, location, start, timeZone } = req.body;
  const tokens = cache.get("google_tokens");
  if (!tokens) {
    return res.status(401).send("Unauthorized");
  }

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Calculate end time as 2 hours after start time
  const endTime = new Date(start);
  endTime.setHours(endTime.getHours() + 3); // Default duration of 2 hours

  const event = {
    summary: summary,
    description: description,
    location: location,
    start: {
      dateTime: start,
      timeZone: timeZone,
    },
    end: {
      dateTime: endTime.toISOString(), // Convert to ISO string format
      timeZone: timeZone,
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error creating event: " + error.message);
  }
});

module.exports = router;
