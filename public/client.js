var socket = io();

var buttons = document.querySelectorAll('#choices button');
for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    socket.send('voteCast', {votingId: this.className, voteContent: this.innerText});
  });
}

var voteConfirmation = document.getElementById('vote-confirmation');
socket.on('voteConfirmation', function (vote) {
  voteConfirmation.innerText = 'Your vote for "' + vote + '" has been counted.';
});
