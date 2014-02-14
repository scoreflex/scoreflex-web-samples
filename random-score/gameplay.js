Game.Gameplay = function() {
  /* RAND GAME */
  var gameBox = document.getElementById("game");
  var scoreBox = document.getElementById("score");
  var playSolo = document.getElementById("actionPlaySolo");
  var showChallenges = document.getElementById("actionShowChallenges");
  var showLeaderboard = document.getElementById("actionShowLeaderboard");
  var showRankbox = document.getElementById("actionShowRankbox");
  var showProfile = document.getElementById("actionShowProfile");
  var getPlayer = document.getElementById("actionGetPlayer");
  var closeWebClient = document.getElementById("actionCloseWebClient");
  var resetSession = document.getElementById("actionReset");


  /* CONTEXT */
  var context = {};
  var displaySoloMode = function(leaderboard) {
    game.classList.remove('mode_challenge');
    game.classList.add('mode_solo');
    context.mode = 'solo';
    context.params = {leaderboardId: leaderboard.getId()};
    scoreBox.innerHTML = 0;
  };
  var displayChallengeMode = function(challenge) {
    game.classList.remove('mode_solo');
    game.classList.add('mode_challenge');
    context.mode = 'challenge';
    context.params = {
      challenge:challenge
    };
    scoreBox.innerHTML = 0;
  };

  /* CHANGE GAME CONTEXT (solo/challenge) */
  playSolo.onclick = function() {
    displaySoloMode(Social.getLeaderboard());
  };

  showChallenges.onclick = function() {
    Social.showChallenges();
  };

  var playLeaderboard = function(leaderboard) {
    displaySoloMode(leaderboard);
  };

  var playChallengeInstance = function(challenge) {
    displayChallengeMode(challenge);
  };

  /* Other Scoreflex game-related requests */
  showLeaderboard.onclick = function() {
    Social.showLeaderboard();
  };

  showRankbox.onclick = function() {
    Social.showRankbox(0);
  };

  showProfile.onclick = function() {
    Social.showCurrentPlayer();
  };

  getPlayer.onclick = function() {
    console.log(Social.getCurrentPlayer());
  };

  closeWebClient.onclick = function() {
    Social.hideWebView();
  };

  resetSession.onclick = function() {
    Social.reset();
  };

  /* STATUS */
  var statusNfo = document.getElementById("status");
  var statusTimer = null;
  var setStatus = function(text, timeout) {
    if (statusTimer) clearTimeout(statusTimer);
    statusNfo.innerHTML = text;
    if (timeout) {
      statusTimer = setTimeout((function(scope){
        return function() {
          statusNfo.innerHTML = "&nbsp;";
        };
      })(this), timeout);
    }
  };

  /* GAME PLAY */
  var playButton = document.getElementById("playButton");
  playButton.onclick = function() {
    var score = Math.floor(Math.random() * 1000) + 300;
    scoreBox.innerHTML = score;
    if (context.mode === 'solo') {
      sendSoloScore(score);
    }
    else if (context.mode === 'challenge') {
      sendChallengeScore(score);
    }
  };

  /* SOLO : send score request */
  var sendSoloScore = function(score) {
    if (context.mode === 'solo') {
      Social.sendLeaderboardScore(score);
      setStatus("Sending score ...", 1000);
    }
  };

  /* CHALLENGE : send score request */
  var sendChallengeScore = function(score) {
    if (context.mode === 'challenge') {
      setStatus("Sending score ...", 2500);
      var challenge = context.params.challenge;
      var onload = function() {
        Social.showChallenge(challenge);
        setStatus("Sent", 1000);
      };
      Social.sendChallengeScore(challenge, score, function() {
        // the score is not available in real time. Wait a little
        setTimeout(onload, 1500);
      });
    }
  };

  /* SOCIAL HANDLER */
  var Social = Game.Social({
    loadLevel:playLeaderboard,
    loadChallenge:playChallengeInstance
  });
  context = {
    mode: 'solo',
    params: {leaderboardId: Social.getLeaderboard().getId()}
  };
};