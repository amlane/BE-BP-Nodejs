const jwt = require("jsonwebtoken");
const secrets = require("../config/secrets.js");

// Verifies the JWT sent in the Authorization header. Supports both a raw token
// and the conventional "Bearer <token>" form. On success the decoded payload is
// attached to req.decodedToken for downstream handlers.

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  jwt.verify(token, secrets.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    req.decodedToken = decoded;
    next();
  });
};
