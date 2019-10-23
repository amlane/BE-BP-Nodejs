# <p align="center">How to Build a Node.js Server Using an SQLite Database</p>

## Creating a Git Repository & Adding Dependencies

### Create a directory for your server to live

- `mkdir < server-directory-name >`
- `git init`
- `npx gitignore node` //creates git.ignore for node
- `npm init -y` //creates package.json

### Add your dependencies

- `npm i express helmet cors knex sqlite3 dotenv pg bcryptjs* jsonwebtoken*`
- `npm i nodemon -D`

`* only if using database with login/register`

- Update package.json scripts to include server (and start) script(s):

```
"scripts": {
	"server": "nodemon",  //defaults to index.js
	"start": "node index.js" (optional, for production)
}
```

## Adding Migrations & Seeding

- `npx knex init` //creates an abstracted knexfile.js

- Update knexfile.js to:

```
module.exports = {
  development: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './data/auth.db3',
    },
    pool: {
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
    migrations: {
      directory: './data/migrations',
    },
    seeds: {
      directory: './data/seeds',
    },
  },
};
```

## Create a table within a migration folder:

- `npx knex migrate:make table_name`

- Example schema for a user table:

```
exports.up = function(knex) {
    return knex.schema.createTable('users', users => {
      users.increments();

      users
        .string('username', 128)
        .notNullable()
        .unique();

      users
        .string('password', 128)
        .notNullable();
    });
  };

  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
  };

```

- `npx knex migrate:latest` (creates .db3 file)
- `npx knex migrate:rollback` (deletes .db3 file)

## Seeding (optional):

- `npx knex seed:make 001-seedName` (makes a new seed)

- Example seeds > 001-exampleSeed.js file:

```
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('table_name').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('table_name').insert([
        { username: 'Amanda', password: '123' },
        { username: 'Herman', password: 'password'  },
        { username: 'Boo', password: 'hello'  }
      ]);
    });
};
```

- `npx knex seed:run` (runs/resets seed)

## Creating Server, Routes and Helper Functions

- In the data directory, create a file called "dbConfig.js" and include the following code:

```
const knex = require('knex');

const knexConfig = require('../knexfile.js');

module.exports = knex(knexConfig.development);
```

- Review the code in this repository for more information.

## <p align="center">< -------- after forking and cloning this repo ----------></p>

- run command `npm install` to get your dependencies listed above.
- If you fork and clone this repo you do not need to follow README steps, they are already completed.
