require("dotenv").config();

const express = require("express");
const router = express.Router();
const cache = require("../cache");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const client_url = process.env.CLIENT_URL;
const jwt_secret = process.env.JWT_SECRET;

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

router.get("/login", (req, res) => {
  const state = jwt.sign({}, jwt_secret, { expiresIn: "15m" });
  res.cookie("google_auth_state", state);

  const auth_url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: state,
  });
  res.redirect(auth_url);
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies ? req.cookies["google_auth_state"] : null;

  try {
    jwt.verify(state, jwt_secret);
  } catch (err) {
    res.redirect(`${client_url}/error?error=state_mismatch`);
    return;
  }

  if (state === null || state !== storedState) {
    res.redirect(`${client_url}/error?error=state_mismatch`);
    return;
  }

  res.clearCookie("google_auth_state");

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Generate JWT containing access and refresh tokens
    const token = jwt.sign(tokens, jwt_secret, { expiresIn: "1h" });

    // Store the token in local storage
    res.redirect(`${client_url}/dashboard?google_token=${token}`);
  } catch (error) {
    res.redirect(`${client_url}/error`);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("google_auth_state");
  res.json({ redirectUrl: "/dashboard" });
});

// Middleware to extract token from query or headers
const extractToken = (req, res, next) => {
  const token =
    req.query.google_token || req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    req.user = jwt.verify(token, jwt_secret);
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
};

router.get("/events", extractToken, async (req, res) => {
  const tokens = req.user;
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

    response.data.items.forEach((event) => {
      const eventId = event.extendedProperties?.private?.eventId;
      if (eventId) {
        const uniqueKey = `${eventId}-${tokens}`;
        if (!cache.has(uniqueKey)) {
          cache.set(uniqueKey, event.id, 3600);
        }
      }
    });

    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error fetching events: " + error.message);
  }
});

router.post("/create-event", extractToken, async (req, res) => {
  const { summary, description, location, start, timeZone, eventId } = req.body;
  const tokens = req.user;
  if (!tokens) {
    return res.status(401).send("Unauthorized");
  }

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const endTime = new Date(start);
  endTime.setHours(endTime.getHours() + 3);

  const event = {
    summary: summary,
    description: description,
    location: location,
    start: {
      dateTime: start,
      timeZone: timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: timeZone,
    },
    extendedProperties: {
      private: {
        eventId: eventId,
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    const eventResponseId = String(response.data.id); // Renamed variable
    const uniqueKey = `${eventId}-${tokens}`; // Use the eventId from req.body
    cache.set(uniqueKey, eventResponseId, 3600); // Use the renamed variable
    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send("Error creating event: " + error.message);
  }
});

router.get("/event-exists", extractToken, async (req, res) => {
  const { eventId } = req.query;
  const tokens = req.user;
  if (!tokens) {
    return res.status(401).send("Unauthorized");
  }

  const uniqueKey = `${eventId}-${tokens}`;
  const googleEventId = cache.get(uniqueKey);
  if (!googleEventId) {
    return res.json({ exists: false });
  }
  res.json({ exists: true });
});

router.delete("/delete-event", extractToken, async (req, res) => {
  const { eventId } = req.body;
  const tokens = req.user;
  if (!tokens) {
    return res.status(401).send("Unauthorized");
  }
  const uniqueKey = `${eventId}-${tokens}`;
  const googleEventId = cache.get(uniqueKey);
  if (!googleEventId) {
    return res.status(404).send("Event not found");
  }

  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  try {
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
    const uniqueKey = `${eventId}-${tokens}`;
    cache.del(uniqueKey);
    res.status(200).send("Event deleted successfully");
  } catch (error) {
    console.error(
      "Google Calendar API Error:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .send(
        "Error deleting event: " +
          (error.response ? error.response.data.error.message : error.message)
      );
  }
});

module.exports = router;
