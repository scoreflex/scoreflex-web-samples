Game.Social = function(gameplay) {
  // FILL THIS VARIABLES
  var clientId = "72d5e76eadfa739fb37ed87cec11502bd360aac1";
  var clientSecret = "96fdc40e3613ca63c952bacd34ff0970eb15497a42ca91002d10c80e0d4ac83b";
  var useSandbox = true;

  var leaderboardId = "highscores";

  /* Scoreflex events listening */
  var sfxEventHandler = function(event) {
    var eventData = event.detail || {};
    var name = eventData.name;
    if (name === 'session') {
      var state = eventData.state;
      var S = Scoreflex.SessionState;
      console.log("Session state is now: "+(state===S.INIT_INPROGRESS?'IN PROGRESS':(S.INIT_SUCCESS?'DONE':'FAILED')));
    }
    else if (name === 'player') {
      console.log("New Player just initialized.", eventData.player);
    }
    // no leaderboard in this game
    else if (name === 'play') {
      var leaderboard = eventData.leaderboard;
      gameplay.loadLevel(leaderboard);
    }
    else if (name === 'challenge') {
      var challenge = eventData.challenge;
      gameplay.loadChallenge(challenge);
    }
  };
  Game.Common.listenEvent(window, 'ScoreflexEvent', sfxEventHandler);

  // init Scoreflex
  var ScoreflexSDK = Scoreflex(clientId, clientSecret, useSandbox);

  /* PLAYER : get */
  var getCurrentPlayer = function() {
    return ScoreflexSDK.Players.getCurrent();
  };

  /* WEB VIEW : Display leaderboard */
  var showLeaderboard = function() {
    ScoreflexSDK.Leaderboards.get(leaderboardId).show();
  };

  /* WEB VIEW : Display rankbox */
  var showRankbox = function(lastScore) {
    ScoreflexSDK.Leaderboards.get(leaderboardId).submitScoreAndShowRankbox(lastScore);
  };

  /* LEADERBOARD : send score */
  var sendLeaderboardScore = function(score) {
    ScoreflexSDK.Leaderboards.get(leaderboardId).submitScore(score);
  };

  /* WEB VIEW : Display all challenges */
  var showChallenges = function() {
    ScoreflexSDK.Challenges.showChallenges();
  };

  /* WEB VIEW : display current challenge */
  var showChallenge = function(challenge) {
    challenge.showDetails();
  };

  /* CHALLENGE : get */
  var getChallengeDetails = function(challenge, onload) {
    var fields = "core,turnHistory,outcome"; // "core,config,turn,turnHistory,outcome"
    challenge.getDetails({fields: fields}, {onload:onload});
  };

  /* CHALLENGE : send score request */
  var sendChallengeScore = function(challenge, score, onload) {
    challenge.submitTurnScore(score, {}, {
      onload: function() {
        if (onload) onload.call();
      },
      onerror: function() {
        console.log("error");
        console.dir(this);
      }
    });
  };

  /* WEB VIEW : hide */
  var hideWebView = function() {
    ScoreflexSDK.WebClient.close();
  };

  return {
    showLeaderboard:showLeaderboard,
    showRankbox:showRankbox,
    sendLeaderboardScore:sendLeaderboardScore,

    showChallenges:showChallenges,
    showChallenge:showChallenge,
    getChallengeDetails:getChallengeDetails,
    sendChallengeScore:sendChallengeScore,

    getCurrentPlayer:getCurrentPlayer,
    hideWebView:hideWebView,
    reset: function() {
      ScoreflexSDK.reset();
      window.location.href = window.location.href;
    }
  };
};

