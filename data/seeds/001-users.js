const bcrypt = require("bcryptjs");

exports.seed = async function(knex) {
  await knex("users").del();

  await knex("users").insert([
    { username: "amanda", password: bcrypt.hashSync("password123", 12) },
    { username: "herman", password: bcrypt.hashSync("password123", 12) }
  ]);
};
