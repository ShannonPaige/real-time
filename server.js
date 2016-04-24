const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)
                    .listen(port, function () {
                      console.log('Listening on port ' + port + '.');
                    });
const generateId = require('./lib/generate-id');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const io = socketIo(server);

app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.locals.title = 'Crowdsource';
app.locals.polls = {};


/* Routes */
app.get('/', function (request, response){
  response.render('index');
});

app.post('/polls', (request, response) => {
  if (!request.body.poll_question) { return response.sendStatus(400); }

  var dashboardId = generateId();
  var votingId = generateId();

  app.locals.polls[dashboardId] = request.body;
  app.locals.polls[dashboardId].votingId = votingId;
  app.locals.polls[dashboardId].dashboardLink = 'http://' + request.headers.host + '/polls/' + dashboardId;
  app.locals.polls[dashboardId].votingLink = 'http://' + request.headers.host + '/polls/' + votingId;

  response.redirect('/polls/' + dashboardId);
});

app.get('/polls/:id', (request, response) => {
  var poll = app.locals.polls[request.params.id];

  response.render('poll-dashboard', { poll: poll });
});


/* Sockets */
io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
  });
});

module.exports = server;
