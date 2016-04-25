module.exports = (poll, votingId, dashboardId, host) => {
  var setPolltoZero = require('./zero-poll');

  poll.votingId = votingId;
  poll.dashboardId = dashboardId;
  poll.dashboardLink = 'http://' + host + '/polls/' + dashboardId;
  poll.votingLink = 'http://' + host + '/polls/vote/' + votingId;
  poll.votes = [];
  poll.voteTally = setPolltoZero(poll.poll_options);
  poll.open = true;
  poll.shareResults = !!poll.shareResults;

  return poll;
};
