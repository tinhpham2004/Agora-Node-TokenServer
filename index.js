const express = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const PORT = process.env.PORT || 8080; // Use environment variable for port

const APP_ID = "0127a16f300f4d0997ba704e3e24b26a"; // Use environment variable for App ID
const APP_CERTIFICATE = "45e520865f9e48e986faae2610c84f8d"; // Use environment variable for App Certificate

const app = express();

const nocache = (req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};

const generateAccessToken = (req, res) => {
  // Set response header
  res.header("Access-Control-Allow-Origin", "*");

  // Get channel name
  const channelName = req.query.channelName;
  if (!channelName) {
    return res.status(500).json({ error: "channel is required" });
  }

  // Get uid
  let uid = req.query.uid;
  if (!uid || uid === "") {
    uid = 0; // Use a placeholder for default uid
  }

  // Get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role === "publisher") {
    role = RtcRole.PUBLISHER;
  }

  // Get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime === "") {
    expireTime = 3600; // Set a default expire time
  } else {
    expireTime = parseInt(expireTime, 10);
  }

  // Calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  // Build the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  // Return the token
  return res.json({ token });
};

app.get("/access_token", nocache, generateAccessToken);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
