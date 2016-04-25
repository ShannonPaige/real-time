var socket = io();

var buttons = document.querySelectorAll('#choices button');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    socket.send('voteCast', {votingId: this.className, voteContent: this.innerText});
  });
}

var addOption = document.getElementById('add_option');
if (!!addOption){
  addOption.addEventListener('click', function (e) {
    e.preventDefault();
    socket.send('addOption');
  });
}

var options = document.getElementById('options');
socket.on('addAnotherOption', function () {
  options.innerHTML = options.innerHTML + 'Option:<input type="text" name="poll_options[]"><br />';
});

var voteConfirmation = document.getElementById('vote-confirmation');
socket.on('voteConfirmation', function (vote) {
  voteConfirmation.innerText = 'Your vote for "' + vote + '" has been counted.';
});

var votesCount = document.getElementById('votes_count');
socket.on('voteCount', function (votingInfo) {
  if (votingInfo.dashboardId === votesCount.className){
    var votingResults = '';
    for (var vote in votingInfo.votes) {
      votingResults += vote + ': ' + votingInfo.votes[vote] + '\n\n';
    }
    votesCount.innerText = votingResults;
  }
});

var votesShare = document.getElementById('votes_share');
socket.on('voteShare', function (votes) {
  var votingResults = '';
  for (var vote in votes) {
    votingResults += vote + ': ' + votes[vote] + '\n\n';
  }
  votesShare.innerText = votingResults;
});

var closePoll = document.getElementById('close_poll');
if (!!closePoll){
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', {votingId: this.className});
  });
}

var pollStatus = document.getElementById('poll_status');
socket.on('pollStatus', function () {
  pollStatus.innerText = 'This poll has been closed for voting';
});
