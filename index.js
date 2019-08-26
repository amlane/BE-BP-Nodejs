const server = require("./API/server.js");

const port = 6000;

server.listen(port, function() {
  console.log(`\n *** Service is running on localhost:${port} *** \n`);
});
