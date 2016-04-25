module.exports = (polls, id) => {
  var currentPoll = '';
  var poll = '';

  for(poll in polls){
    if(polls[poll].votingId === id){
      currentPoll = polls[poll];
    }
  }
  return currentPoll;
};
