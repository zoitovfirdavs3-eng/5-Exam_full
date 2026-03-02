const jwt = require("jsonwebtoken");
const { HttpError } = require("./errors");

const ACCESS_KEY = process.env.ACCESS_TOKEN_KEY;
const REFRESH_KEY = process.env.REFRESH_TOKEN_KEY;

if (!ACCESS_KEY || !REFRESH_KEY) {
  // server start bo'lganda xato chiqishi uchun
  console.warn("⚠️ ACCESS_TOKEN_KEY yoki REFRESH_TOKEN_KEY .env da yo'q");
}

function signAccess(payload) {
  return jwt.sign(payload, ACCESS_KEY, { expiresIn: "15m" });
}
function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_KEY, { expiresIn: "30d" });
}
function verifyAccess(token) {
  try {
    return jwt.verify(token, ACCESS_KEY);
  } catch (e) {
    throw new HttpError(401, "Invalid access token");
  }
}
function verifyRefresh(token) {
  try {
    return jwt.verify(token, REFRESH_KEY);
  } catch (e) {
    throw new HttpError(401, "Invalid refresh token");
  }
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
