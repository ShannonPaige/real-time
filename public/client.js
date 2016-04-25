var socket            = io();

var addOption         = document.getElementById('add_option');
var buttons           = document.querySelectorAll('#choices button');
var closePoll         = document.getElementById('close_poll');
var options           = document.getElementById('options');
var pollStatus        = document.getElementById('poll_status');
var voteConfirmation  = document.getElementById('vote-confirmation');
var votesCount        = document.getElementById('votes_count');
var votesShare        = document.getElementById('votes_share');

/* EVENT LISTENERS */
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    socket.send('voteCast', {votingId: this.className, voteContent: this.innerText});
  });
}

if (!!addOption){
  addOption.addEventListener('click', function (e) {
    e.preventDefault();
    socket.send('addOption');
  });
}

if (!!closePoll){
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', {votingId: this.className});
  });
}


/* SOCKETS */
socket.on('addAnotherOption', function () {
  options.innerHTML = options.innerHTML + 'Option:<input type="text" name="poll_options[]"><br />';
});

socket.on('voteConfirmation', function (vote) {
  voteConfirmation.innerText = 'Your vote for "' + vote + '" has been counted.';
});

socket.on('voteCount', function (votingInfo) {
  if (!!votesCount && votingInfo.dashboardId === votesCount.className){
    appendCurrentPoll(votingInfo, votesCount);
  }
});

socket.on('voteShare', function (votingInfo) {
  if (!!votesShare && votingInfo.votingId === votesShare.className){
    appendCurrentPoll(votingInfo, votesShare);
  }
});

socket.on('pollStatus', function () {
  pollStatus.innerText = 'This poll has been closed for voting';
});


/* HELPERS */
function appendCurrentPoll(votingInfo, div) {
  var votingResults = '';
  for (var vote in votingInfo.votes) {
    votingResults += vote + ': ' + votingInfo.votes[vote] + '\n\n';
  }
  div.innerText = votingResults;
}
