// require('locus');
var http            = require('http');
var express         = require('express');
var app             = express();
var port            = process.env.PORT || 3000;
var countVotes      = require('./lib/count-votes');
var findCurrentPoll = require('./lib/find-current-poll');
var generateId      = require('./lib/generate-id');
var pollVariables   = require('./lib/poll-variables');
var bodyParser      = require('body-parser');
var socketIo        = require('socket.io');
var server          = http.createServer(app);
var currentPoll     = '';
var io              = socketIo(server);


if (!module.parent) {
  server.listen(port, function () {
    console.log('Listening on port ' + port + '.');
  });
}

app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.locals.title = 'Crowdsource';
app.locals.polls = {};


/* ROUTES */
app.get('/', function (request, response){
  response.render('index');
});

app.post('/polls', (request, response) => {
  if (!request.body.poll_question) { return response.sendStatus(400); }

  var dashboardId = generateId();
  var votingId = generateId();
  app.locals.polls[dashboardId] = request.body;
  pollVariables(app.locals.polls[dashboardId], votingId, dashboardId, request.headers.host);

  response.redirect('/polls/' + dashboardId);
});

app.get('/polls/:id', (request, response) => {
  var poll = app.locals.polls[request.params.id];
  response.render('poll-dashboard', { poll: poll });
});

app.get('/polls/vote/:id', (request, response) => {
  currentPoll = findCurrentPoll(app.locals.polls, request.params.id);

  response.render('poll-voting', { poll: currentPoll });
});


/* SOCKETS */
io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  socket.on('message', function (channel, message) {

    if (channel === 'voteCast') {
      currentPoll = findCurrentPoll(app.locals.polls, message.votingId);
      currentPoll.votes[socket.id] = message.voteContent;
      socket.emit('voteConfirmation', message.voteContent);

      var voteCount = countVotes(currentPoll.voteTally, currentPoll.votes);
      if(currentPoll.shareResults === true){
        io.sockets.emit('voteShare', {votingId: currentPoll.votingId, votes: voteCount});
      }
      io.sockets.emit('voteCount', {dashboardId: currentPoll.dashboardId, votes: voteCount});
    }

    if (channel === 'closePoll') {
      currentPoll = findCurrentPoll(app.locals.polls, message.votingId);
      currentPoll.open = false;
      io.sockets.emit('pollStatus');
    }

    if (channel === 'addOption') {
      socket.emit('addAnotherOption');
    }
  });

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
  });
});

module.exports = server;
