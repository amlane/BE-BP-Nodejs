// Knex configuration. Values can be overridden via environment variables
// (see .env.example). The active environment is chosen by NODE_ENV.

require("dotenv").config({ quiet: true });

const sharedSqliteOptions = {
  client: "better-sqlite3",
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, done) => {
      conn.pragma("foreign_keys = ON");
      done();
    }
  },
  migrations: {
    directory: "./data/migrations"
  },
  seeds: {
    directory: "./data/seeds"
  }
};

module.exports = {
  development: {
    ...sharedSqliteOptions,
    connection: {
      filename: process.env.DATABASE_FILE || "./data/auth.db3"
    }
  },

  test: {
    ...sharedSqliteOptions,
    connection: {
      filename: ":memory:"
    }
  },

  production: {
    ...sharedSqliteOptions,
    connection: {
      filename: process.env.DATABASE_FILE || "./data/auth.db3"
    }
  }
};
