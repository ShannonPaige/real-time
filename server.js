require('locus');

const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app)
                    .listen(port, function () {
                      console.log('Listening on port ' + port + '.');
                    });
const generateId = require('./lib/generate-id');
const countVotes = require('./lib/count-votes');
const setPolltoZero = require('./lib/zero-poll');
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
  app.locals.polls[dashboardId].dashboardId = dashboardId;
  app.locals.polls[dashboardId].dashboardLink = 'http://' + request.headers.host + '/polls/' + dashboardId;
  app.locals.polls[dashboardId].votingLink = 'http://' + request.headers.host + '/polls/vote/' + votingId;
  app.locals.polls[dashboardId].votes = [];
  app.locals.polls[dashboardId].voteTally = setPolltoZero(app.locals.polls[dashboardId].poll_options);
  app.locals.polls[dashboardId].open = true;
  app.locals.polls[dashboardId].shareResults = !!app.locals.polls[dashboardId].shareResults;


  response.redirect('/polls/' + dashboardId);
});

app.get('/polls/:id', (request, response) => {
  var poll = app.locals.polls[request.params.id];
  response.render('poll-dashboard', { poll: poll });
});

app.get('/polls/vote/:id', (request, response) => {
  var currentPoll = '';
  for(var poll in app.locals.polls){
    if(app.locals.polls[poll].votingId === request.params.id){
      currentPoll = app.locals.polls[poll];
    }
  }
  response.render('poll-voting', { poll: currentPoll });
});


/* Sockets */
io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  socket.on('message', function (channel, message) {
    var currentPoll = '';
    var poll = '';

    if (channel === 'voteCast') {
      for(poll in app.locals.polls){
        if(app.locals.polls[poll].votingId === message.votingId){
          currentPoll = app.locals.polls[poll];
        }
      }
      currentPoll.votes[socket.id] = message.voteContent;
      socket.emit('voteConfirmation', message.voteContent);
      var voteCount = countVotes(currentPoll.voteTally, currentPoll.votes);
      if(currentPoll.shareResults === true){
        io.sockets.emit('voteShare', {votingId: currentPoll.votingId, votes: voteCount});
      }
      io.sockets.emit('voteCount', {dashboardId: currentPoll.dashboardId, votes: voteCount});
    }

    if (channel === 'closePoll') {
      for(poll in app.locals.polls){
        if(app.locals.polls[poll].votingId === message.votingId){
          currentPoll = app.locals.polls[poll];
        }
      }
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
