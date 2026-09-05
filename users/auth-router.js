const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrets = require("../config/secrets.js");

const Users = require("./users-model.js");

const BCRYPT_ROUNDS = 12;

// for endpoints beginning with /api/auth
router.post("/register", validateUserContent, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const saved = await Users.add({ username, password: hash });
    const token = generateToken(saved);

    res.status(201).json({
      user: saved,
      message: `Welcome, ${saved.username}`,
      token
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT" || error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ message: "Username is already taken" });
    }
    res.status(500).json({ message: "Failed to register user" });
  }
});

router.post("/login", validateUserContent, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findBy({ username }).first();

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user);

      res.status(200).json({
        user: { id: user.id, username: user.username },
        message: `Welcome back, ${user.username}`,
        token
      });
    } else {
      res.status(401).json({ message: "Invalid Username or Password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to log in" });
  }
});

// ---------------------- Generate Token ---------------------- //

function generateToken(user) {
  const payload = {
    subject: user.id, // standard claim = sub
    username: user.username
  };
  const options = {
    expiresIn: "7d"
  };
  return jwt.sign(payload, secrets.jwtSecret, options);
}

// ---------------------- Custom Middleware ---------------------- //

function validateUserContent(req, res, next) {
  const { username, password } = req.body || {};

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password.trim()
  ) {
    res
      .status(400)
      .json({ message: "Username & password fields are required." });
  } else {
    next();
  }
}

module.exports = router;
