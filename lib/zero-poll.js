module.exports = (vote_options) => {
  var voteCount = {};
  for (var i = 0; i< vote_options.length; i++) {
    voteCount[vote_options[i]] = 0;
  }
  return voteCount;
};
