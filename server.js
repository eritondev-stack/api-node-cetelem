require('dotenv').config()
const http = require('http');
const port = process.env.PORT || 3000;
const app = require('./app')
const server = http.createServer(app);

//Socket.IO
const io = require('socket.io')(server)

//Definir como global
global.io = io
//Importar os metodos separados
require('./socket.io')


console.log('Executando na porta ' + port)
server.listen(port);









