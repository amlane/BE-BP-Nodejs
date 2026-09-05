require("dotenv").config({ quiet: true });

const server = require("./API/server.js");

const port = process.env.PORT || 8000;

server.listen(port, function() {
  console.log(`\n *** Service is running on localhost:${port} *** \n`);
});
