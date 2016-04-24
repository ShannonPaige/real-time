module.exports = (voteCount, votes) => {
  for (var option in voteCount) {
    voteCount[option] = 0;
  }
  for (var vote in votes) {
    voteCount[votes[vote]]++;
  }
  return voteCount;
};
