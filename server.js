const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)
                    .listen(port, function () {
                      console.log('Listening on port ' + port + '.');
                    });
const socketIo = require('socket.io');
const io = socketIo(server);

app.set('view engine', 'jade');

app.use(express.static('public'));

app.locals.title = 'Crowdsource';


/* Routes */
app.get('/', function (request, response){
  response.render('index');
});


/* Sockets */
io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
  });
});

module.exports = server;
