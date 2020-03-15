require("dotenv").config();
const http = require("http");
const port = process.env.PORT || 3000;
const app = require("./app");
const server = http.createServer(app);

const io = require("socket.io")(server);

global.io = io;

require("./socket.io");

console.log("Executando na porta " + port);
server.listen(port);
