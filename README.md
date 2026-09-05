# <p align="center">Node.js + Express API with JWT Auth (Knex / SQLite)</p>

A small boilerplate for a Node.js REST API with register/login, password hashing
(bcrypt), JWT-protected routes, and a Knex + SQLite database.

Stack: **Express 4**, **Knex 3**, **better-sqlite3**, **helmet 8**, **bcryptjs 3**,
**jsonwebtoken 9**, **express-rate-limit 8**, **dotenv**. Requires **Node 20+**.

---

## Quick start (after forking / cloning)

```bash
nvm use                 # optional, respects .nvmrc (Node 20)
npm install
cp .env.example .env     # then set JWT_SECRET
npm run migrate          # create data/auth.db3 from migrations
npm run seed             # optional: insert sample users
npm run server           # start with nodemon on http://localhost:8000
```

Other scripts:

| Command | Description |
| --- | --- |
| `npm start` | Run without nodemon (production) |
| `npm test` | Run the Vitest + Supertest suite (uses an in-memory DB) |
| `npm run migrate` / `npm run rollback` | Apply / undo migrations |
| `npm run seed` | Run seed files |

---

## Environment variables

Configured in `.env` (git-ignored). See `.env.example`.

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `8000` | HTTP port |
| `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| `JWT_SECRET` | dev fallback | **Required in production** — the app throws without it |
| `DATABASE_FILE` | `./data/auth.db3` | SQLite file location |

---

## API

| Method | Route | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | – | `{ username, password }` | Create a user, returns `{ user, token }` |
| `POST` | `/api/auth/login` | – | `{ username, password }` | Returns `{ user, token }` |
| `GET` | `/api/users` | Bearer token | – | List users (no password hashes) |
| `GET` | `/api/users/:id` | Bearer token | – | One user |

Send the token as `Authorization: Bearer <token>` (a raw token without the
`Bearer ` prefix is also accepted). The `/api/auth` routes are rate-limited to
20 requests per 15 minutes per IP.

---

## Project layout

```
index.js                     entrypoint (loads .env, starts the server)
knexfile.js                  per-environment Knex config
API/server.js                Express app: middleware + route mounting
config/secrets.js            JWT secret resolution
middleware/
  restricted-middleware.js   verifies the JWT, attaches req.decodedToken
users/
  auth-router.js             /api/auth register + login
  users-router.js            /api/users (restricted)
  users-model.js             DB helpers
data/
  dbConfig.js                Knex instance for the active NODE_ENV
  migrations/                schema
  seeds/                     sample data
test/
  auth.test.js               integration tests
```

---

## Notes on building this from scratch

1. `npm init -y`, then `npm i express helmet cors knex better-sqlite3 dotenv express-rate-limit bcryptjs jsonwebtoken` and `npm i -D nodemon vitest supertest`.
2. `npx knex init`, then point the config at `better-sqlite3`:

   ```js
   module.exports = {
     development: {
       client: "better-sqlite3",
       useNullAsDefault: true,
       connection: { filename: "./data/auth.db3" },
       pool: {
         afterCreate: (conn, done) => {
           conn.pragma("foreign_keys = ON");
           done();
         }
       },
       migrations: { directory: "./data/migrations" },
       seeds: { directory: "./data/seeds" }
     }
   };
   ```

3. `npx knex migrate:make users` and define the schema (see `data/migrations/`).
4. `npx knex seed:make 001-users` — note that in Knex 3 the seed signature is
   `exports.seed = async function (knex) { ... }` (no `Promise` argument).
5. `data/dbConfig.js`:

   ```js
   const knex = require("knex");
   const config = require("../knexfile.js");
   module.exports = knex(config[process.env.NODE_ENV || "development"]);
   ```
