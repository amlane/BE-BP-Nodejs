require("dotenv").config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret && isProduction) {
  throw new Error(
    "JWT_SECRET environment variable is required in production. See .env.example."
  );
}

module.exports = {
  jwtSecret: jwtSecret || "the secret message is drink more ovaltine"
};
