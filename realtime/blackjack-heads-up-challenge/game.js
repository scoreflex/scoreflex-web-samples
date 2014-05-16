var myGame = new (function MyGame() {
    /**********************************************************************/
    /*********************** Scoreflex identifiers ************************/
    /**********************************************************************/
    // FILL THESE VARIABLES
    var gameName     = 'Blackjack - Heads up';
    var clientId     = '91ece54c54e2de541e90bc4ae425483877b3b9c9';
    var clientSecret = '0e41ce0e918f8d7a96879fa7f58a3a2683d02b5387953de1a238e57b50cdf838';
    var useSandbox   = true;


    /**********************************************************************/
    /**************************** My variables ****************************/
    /**********************************************************************/
    // Define Scoreflex objects
    var me                = this;
    var scoreflex         = null;
    var realtimeSession   = null;
    var challenge         = null;
    var challengeDetails  = null;
    var blackjackTable    = null;
    var blackjackPlayers  = null;

    /**********************************************************************/
    /*************************** Misc functions ***************************/
    /**********************************************************************/
    // Return the current time. Used to log messages
    var getTime = function() {
        var date = new Date();
        var time = date.toLocaleTimeString();
        var ms   = date.getMilliseconds();
        if (ms < 10)
            return ("["+time+ ".00"+ms+"]");
        else if (ms < 100)
            return ("["+time+ ".0"+ms+"]");
        return ("["+time+ "."+ms+"]");
    };

    // print log message, prefixed by the current time.
    var logInfo = function(msg) {
        console.log("%c"+getTime()+" %c"+msg, "color:red;font-weight:bold", "");
    };

    // Show error message
    var showError = function(msg) {
        logInfo(msg);
        document.getElementById("error").innerHTML = msg;
    };

    // Hide error message
    var hideError = function() {
        document.getElementById("error").innerHTML = "";
    };

    // Helper function to register a listener on a specified event target
    var listenEvent = function(element, eventType, handler) {
        if(element.addEventListener) {
            element.addEventListener(eventType, handler, false);
        }
        else if(element.attachEvent) {
            element.attachEvent( "on" + eventType, handler);
        }
    };


    // Initialize the scoreflex SDK
    var initializeSDK = function() {
        if (scoreflex) {
            deinitializeSDK();
        }
        var el = document.getElementById("scoreflexWebClient_full");
        if (el) {
            document.body.removeChild(el);
        }
        scoreflex = new Scoreflex(clientId, clientSecret, useSandbox);
    };

    // Deinitialize the scoreflex SDK
    var deinitializeSDK = function() {
        document.getElementById("startTrainingBtn").className = "disabled";
        document.getElementById("startTrainingBtn").onclick   = null;
        stopRealtimeSession();
        scoreflex.destroy();
        scoreflex = null;
    };

    // Retrieve the realtime session and initialize it
    var startRealtimeSession = function() {
        realtimeSession = scoreflex.getRealtimeSession();
        if (!realtimeSession.isInitialized()) {
            realtimeSession.initialize(realtimeSessionInitializedListener);
        }
        else {
            realtimeSessionInitializedListener.onInitialized();
        }
    };

    // Destroy the realtime session, if needed
    var stopRealtimeSession = function() {
        if (realtimeSession) {
            if (realtimeSession.isConnected()) {
                disconnectRealtimeSession();
            }
            scoreflex.destroyRealtimeSession();
        }
        realtimeSession = null;
    };

    // Open a connection on the realtime service
    var connectRealtimeSession = function() {
        if (realtimeSession.isConnected() === false)
            realtimeSession.connect(connectionListener);
    };

    // Close the realtime connection
    var disconnectRealtimeSession = function() {
        realtimeSession.disconnect();
    };


    // Check challenge configurations. If no realtime challenge is found, there
    // is an error.
    var checkRealtimeChallenges = function() {
        scoreflex.RestClient.get("/challenges/configs", {}, {
            onload: function() {
                var hasRealtimeChallenge = false;
                for (var id in this.responseJSON.challengeConfigs) {
                    var c = this.responseJSON.challengeConfigs[id];
                    if (c.realtimeConfig && c.realtimeConfig.enabled === true) {
                        hasRealtimeChallenge = true;
                        logInfo("Challenge config '"+id+"' is a realtime challenge");
                    }
                }
                if (hasRealtimeChallenge === true) {
                    document.getElementById("showChallengesBtn").className = "enabled";
                    document.getElementById("showChallengesBtn").onclick   = function() {
                        scoreflex.Challenges.showChallenges();
                    }
                    document.getElementById("newChallengeBtn").className = "enabled";
                    document.getElementById("newChallengeBtn").onclick   = function() {
                        scoreflex.WebClient.show("/web/challenges/new", {}, {}, {style: 'full'});
                    }
                }
                else {
                    showError("No realtime challenge config found");
                }
            },

            onerror: function() {
                showError("Failed to check realtime challenges");
            }
        });
    };

    var startTraining = function() {
        logInfo("Starting new training game...");
        blackjackPlayers = new Array();
        blackjackPlayers.push(new BJPlayer(me));
        blackjackPlayers.push(new BJIA(me));

        blackjackTable = new BJTable(blackjackPlayers, Math.random());

        me.onHit = function() {};
        me.onStand = function() {};
        me.onGiveUp = function() {
            logInfo("stopping training game...");
            setTimeout(function() {
                blackjackTable.stop();
                blackjackTable   = null;
                blackjackPlayers = null;
            }, 1500);
            me.onHit    = null;
            me.onStand  = null;
            me.onGiveUp = null;
            me.onWin    = null;
            me.onLoose  = null;
        };
        me.onWin = function() {
            setTimeout(function() { blackjackTable.start(); }, 3500);
        };
        me.onLoose = function() {
            setTimeout(function() { blackjackTable.start(); }, 3500);
        };

        blackjackTable.start();
    };

    var startChallenge = function(playerIds, seed) {
        logInfo("Starting new challenge game...");
        playerIds.sort();
        blackjackPlayers = new Array();
        for (var i = 0; i < playerIds.length; ++i) {
            if (playerIds[i] == scoreflex.Players.getCurrent().getId()) {
                blackjackPlayers.push(new BJPlayer(me));
            }
            else {
                blackjackPlayers.push(new BJOpponent(playerIds[i], me));
            }
        }
        blackjackTable = new BJTable(blackjackPlayers, seed);

        me.onHit = function() {
            var payload = {"action": "hit"};
            var listener = {
                onSuccess: function() {},
                onFailure: function() {}
            };
            for (var i = 0; i < blackjackPlayers.length; ++i) {
                var to = blackjackPlayers[i].getId();
                if (to != scoreflex.Players.getCurrent().getId())
                    realtimeSession.sendReliableMessage(listener, to, 0, payload);
            }
        };
        me.onStand = function() {
            var payload = {"action": "stand"};
            var listener = {
                onSuccess: function() {},
                onFailure: function() {}
            };
            for (var i = 0; i < blackjackPlayers.length; ++i) {
                var to = blackjackPlayers[i].getId();
                if (to != scoreflex.Players.getCurrent().getId())
                    realtimeSession.sendReliableMessage(listener, to, 0, payload);
            }
        };
        me.onGiveUp = function() {
            var url = "/challenges/instances/"+challengeDetails.id+"/resignation";
            scoreflex.RestClient.post(url, {}, {}, {/*FIXME*/});
            realtimeSession.stopMatch();
        };
        me.onWin = function() {
            if (blackjackTable.getTurn() == 5) {
                for (var i = 0; i < blackjackPlayers.length; ++i) {
                    if (blackjackPlayers[i].getId() == scoreflex.Players.getCurrent().getId()) {
                        var score = blackjackPlayers[i].getScore();
                        challenge.submitTurnScore(score, {}, {/*FIXME*/});
                    }
                }
                setTimeout(function() { realtimeSession.stopMatch(); }, 3500);
            }
            else {
                setTimeout(function() { blackjackTable.start(); }, 3500);
            }
        };
        me.onLoose = function(id) {
            if (blackjackTable.getTurn() == 5) {
                for (var i = 0; i < blackjackPlayers.length; ++i) {
                    if (blackjackPlayers[i].getId() == scoreflex.Players.getCurrent().getId()) {
                        var score = blackjackPlayers[i].getScore();
                        challenge.submitTurnScore(score, {}, {/*FIXME*/});
                    }
                }
                setTimeout(function() { realtimeSession.stopMatch(); }, 3500);
            }
            else {
                setTimeout(function() { blackjackTable.start(); }, 3500);
            }
        };

        blackjackTable.start();
    };

    var stopChallenge = function(showDetails) {
        logInfo("stopping challenge game...");
        document.getElementById("waiting").className = "";

        if (blackjackTable != null)
            blackjackTable.stop();
        blackjackTable   = null;
        blackjackPlayers = null;

        me.onHit    = null;
        me.onStand  = null;
        me.onGiveUp = null;
        me.onWin    = null;
        me.onLoose  = null;


        if (showDetails === true && challenge != null) {
            challenge.showDetails();
            setTimeout(function() {
                document.getElementById("waiting").className = "hidden";
            }, 5000);
        }
        else {
            document.getElementById("waiting").className = "hidden";
        }

        challenge        = null;
        challengeDetails = null;
    };

    /**********************************************************************/
    /**************************** Event listeners *************************/
    /**********************************************************************/
    // Main scoreflex event handler:
    //   - catch the scorefles SDK initialization result, the 'session' events
    //   - catch player login/logout, the 'player' events
    //   - catch 'challenge' events
    //
    // ignore 'play' events for now.
    var scoreflexEventHandler = function(event) {
        var eventData = event.detail || {};
        // Handle session events
        if (eventData.name === 'session') {
            if (eventData.state === Scoreflex.SessionState.INIT_SUCCESS) {
                document.getElementById("startTrainingBtn").className = "enabled";
                document.getElementById("startTrainingBtn").onclick   = function() { startTraining.call(me); };
                checkRealtimeChallenges();
                startRealtimeSession();
            }
            else if (eventData.state === Scoreflex.SessionState.INIT_FAILED) {
                showError("Scoreflex SDK initialization failed");
                setTimeout(function() { hideError(); initializeSDK(); }, 2000);
            }
        }

        // Handle player events
        else if (eventData.name === 'player') {
            if (scoreflex.getSessionState() === Scoreflex.SessionState.INIT_SUCCESS) {
                stopRealtimeSession();
                startRealtimeSession();
            }
        }

        // Handle challenges events
        else if (eventData.name === 'challenge') {
            document.getElementById("waiting").className = "";
            challenge = eventData.challenge;
            challenge.getDetails({}, challengeEventHandler);
        }
    };

    // Realtime session listener:
    //   - catch the realtime session initialization/deinitialization events
    var realtimeSessionInitializedListener = {
        onInitialized: function() {
            connectRealtimeSession();
        },
        onInitializationFailed: function(status) {
            showError("Scoreflex realtime session initialization failed");
            setTimeout(function() { hideError(); startRealtimeSession(); }, 2000);
        },
        onDeInitialized: function() {
            realtimeSession = null;
        }
    };

    // Realtime connection listener:
    //   - catch connection status changes
    var connectionListener = {
        onConnected: function(info) {
        },
        onConnectionFailed: function(status) {
            showError("Realtime onnection failed");
            setTimeout(function() { hideError(); connectRealtimeSession(); }, 2000);
        },
        onConnectionClosed: function(status) {
            showError("Realtime onnection closed");
            setTimeout(function() { hideError(); connectRealtimeSession(); }, 2000);
        },
        onReconnecting: function(status) {}
    };

    // Challenge instance event handler:
    //   - catch details about a challenge instance. This should be a "running"
    //     realtime challenge to be playable.
    var challengeEventHandler = {
        onload: function() {
            challengeDetails = this.responseJSON;
            if (!challengeDetails.realtime || challengeDetails.status != "running") {
                document.getElementById("waiting").className = "hidden";
                challenge        = null;
                challengeDetails = null;
                return;
            }

            if (realtimeSession.isConnected()) {
                realtimeSession.joinRoom(challengeDetails.realtime.roomId,
                                         roomListener, messageListener);
            }
            else {
                showError("Realtime connection is not opened");
                stopChallenge(false);
                setTimeout(function() { hideError(); connectRealtimeSession(); }, 2000);
            }
        },

        onerror: function() {
            showError("Failed to get challenge details");
            setTimeout(function() {
                hideError();
                challenge.getDetails({}, challengeEventHandler);
            }, 2000);
        }
    };

    // Realtime room listener:
    //   - catch room changes. Realtime challenges are managed here.
    var roomListener = {
        onRoomClosed: function(status, roomId) {
            stopChallenge(true);
        },

        onRoomJoined: function(status, room) {
            if (status === Scoreflex.Realtime.StatusCode.STATUS_SUCCESS) {
                switch (room.getMatchState()) {
                case Scoreflex.Realtime.MatchState.PENDING:
                    break;
                case Scoreflex.Realtime.MatchState.RUNNING:
                    stopChallenge(true);
                    break;
                case Scoreflex.Realtime.MatchState.READY:
                    if (room.getParticipants().length == challengeDetails.turn.currentPlayers.length)
                        realtimeSession.startMatch();
                    break;
                case Scoreflex.Realtime.MatchState.FINISHED:
                    stopChallenge(true);
                    break;
                }
            }
            else {
                showError("Failed to the realtime challenge");
                stopChallenge(false);
            }
        },

        onRoomLeft: function(status, roomId) {
            stopChallenge(true);
        },

        onPeerJoined: function(room, peerId) {
        },

        onPeerLeft: function(room, peerId) {
        },

        onMatchStateChanged: function(status, room, oldState, newState) {
            if (oldState == newState || status != Scoreflex.Realtime.StatusCode.STATUS_SUCCESS)
                return;

            switch (newState) {
              case Scoreflex.Realtime.MatchState.PENDING:
                break;
              case Scoreflex.Realtime.MatchState.RUNNING:
                startChallenge(room.getParticipants(), challengeDetails.seed);
                break;
              case Scoreflex.Realtime.MatchState.READY:
                if (room.getParticipants().length == challengeDetails.turn.currentPlayers.length) {
                    realtimeSession.startMatch();
                }
                break;
              case Scoreflex.Realtime.MatchState.FINISHED:
                realtimeSession.leaveRoom();
                stopChallenge(true);
                break;
            }
        },

        onRoomPropertyChanged: function(room, from, key) {
        },

        onSetRoomPropertyFailed: function(status, room, key) {
        }
    };

    // Realtime message listener:
    //   - catch messages received in a room. We handle opponent action here
    var messageListener = {
        onMessageReceived: function(room, from, tag, payload) {
            for (var i = 0; i < blackjackPlayers.length; ++i) {
                if (from == blackjackPlayers[i].getId()) {
                    var action = payload.get("action");
                    if (action == "hit") {
                        blackjackPlayers[i].hit();
                    }
                    else if (action == "stand") {
                        blackjackPlayers[i].stand();
                    }
                    return;
                }
            }
        }
    };

    /**********************************************************************/
    /************************* Object initialization **********************/
    /**********************************************************************/
    // Register The scoreflex event handler and initialiaze the scoreflex SDK
    listenEvent(window, 'ScoreflexEvent', scoreflexEventHandler);
    initializeSDK();

    // Export main objects
    this.scoreflex         = function() { return scoreflex; };
    this.realtimeSession   = function() { return realtimeSession; };
})();
