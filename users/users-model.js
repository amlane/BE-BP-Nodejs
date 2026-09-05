const db = require("../data/dbConfig.js");

module.exports = {
  add,
  find,
  findBy,
  findById
};

// Public listing — never expose the password hash.
function find() {
  return db("users").select("id", "username");
}

// Used for auth; returns the full row including the password hash.
function findBy(filter) {
  return db("users").where(filter);
}

async function add(user) {
  const [inserted] = await db("users").insert(user).returning("id");
  const id = typeof inserted === "object" ? inserted.id : inserted;

  return findById(id);
}

function findById(id) {
  return db("users")
    .where({ id })
    .select("id", "username")
    .first();
}
