Game.Social = function(gameplay) {
  /* Scoreflex identifiers */
  // FILL THIS VARIABLES
  var gameName = 'myGameName';
  var clientId = '<yourOwnClientIdHere>';
  var clientSecret = '<yourOwnClientSecretHere>';
  var leaderboardId = 'BestScores';

  var useSandbox = true;

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
  window.scoreflexSDK=ScoreflexSDK;
  var soloLeaderboard = ScoreflexSDK.Leaderboards.get(leaderboardId);

  /* PLAYER : get */
  var getCurrentPlayer = function() {
    return ScoreflexSDK.Players.getCurrent();
  };

  /* WEB VIEW : Show current player */
  var showCurrentPlayer = function() {
    getCurrentPlayer().showProfile();
  };

  /* WEB VIEW : Display leaderboard */
  var showLeaderboard = function() {
    ScoreflexSDK.Leaderboards.get(leaderboardId).show({collapsingMode:'none'});
  };

  var getLeaderboard = function() {
    return ScoreflexSDK.Leaderboards.get(leaderboardId);
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
    getLeaderboard:getLeaderboard,
    showRankbox:showRankbox,
    sendLeaderboardScore:sendLeaderboardScore,

    showChallenges:showChallenges,
    showChallenge:showChallenge,
    getChallengeDetails:getChallengeDetails,
    sendChallengeScore:sendChallengeScore,

    getCurrentPlayer:getCurrentPlayer,
    showCurrentPlayer:showCurrentPlayer,
    hideWebView:hideWebView,
    reset: function() {
      ScoreflexSDK.reset();
      window.location.href = window.location.href;
    }
  };
};