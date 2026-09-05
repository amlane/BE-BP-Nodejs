const router = require("express").Router();

const Users = require("./users-model.js");
const restricted = require("../middleware/restricted-middleware.js");

// All user data requires a valid token.
router.use(restricted);

router.get("/", (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ message: "Failed to retrieve users" });
    });
});

router.get("/:id", verifyUserId, (req, res) => {
  res.status(200).json(req.user);
});

// ---------------------- Custom Middleware ---------------------- //

function verifyUserId(req, res, next) {
  Users.findById(req.params.id)
    .then(user => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).json({ message: "User Not Found." });
      }
    })
    .catch(err => {
      res.status(500).json({ message: "Failed to retrieve user" });
    });
}

module.exports = router;
