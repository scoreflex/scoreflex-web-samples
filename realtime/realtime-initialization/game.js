var myGame = new (function MyGame() {
    /**********************************************************************/
    /*********************** Scoreflex identifiers ************************/
    /**********************************************************************/
    // FILL THESE VARIABLES
    var gameName     = 'Realtime initialization sample';
    var clientId     = '91ece54c54e2de541e90bc4ae425483877b3b9c9';
    var clientSecret = '0e41ce0e918f8d7a96879fa7f58a3a2683d02b5387953de1a238e57b50cdf838';
    var useSandbox   = true;


    /**********************************************************************/
    /**************************** My variables ****************************/
    /**********************************************************************/
    // Define Scoreflex objects
    var scoreflex       = null;
    var realtimeSession = null;

    // Retrieve DOM elements
    var infoEl          = document.getElementById("infoDiv");
    var restartButtonEl = document.getElementById("restartButton");
    var stopButtonEl    = document.getElementById("stopButton");
    var profileButtonEl = document.getElementById("showProfileButton");
    var clearButtonEl   = document.getElementById("clearLogButton");
    clearButtonEl.onclick = function() { infoEl.innerHTML = ''; };


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

    // Add a log message in the info box, prefixed by the current time.
    var logInfo = function(msg) {
        msg = msg.replace(/\n/g, "<br>");
        infoEl.innerHTML += '<div class="infoLine">'
            + '<span class="infoDate">'+getTime()+'</span>'
            + '<span class="infoTxt"><pre>'+msg+'</pre></span>'
            + '</div>';
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


    // Initialize the scoreflex SDK:
    //   1. The scoreflex object is destroyed, if needed
    //   2. Buttons state is reset
    //   3. The opened scoreflex webview is closed, if any
    //   4. The scoreflex object is created (with a delay, for testing purpose)
    var initializeSDK = function() {
        if (scoreflex) {
            deinitializeSDK();
        }

        logInfo("Scoreflex SDK initializing...");
        restartButtonEl.className  = "disabled";
        restartButtonEl.onclick    = null;
        stopButtonEl.className     = "disabled";
        stopButtonEl.onclick       = null;
        profileButtonEl.className  = "disabled";
        profileButtonEl.onclick    = null;

        var el = document.getElementById("scoreflexWebClient_full");
        if (el) {
            document.body.removeChild(el);
        }

        setTimeout(function() {
            scoreflex = new Scoreflex(clientId, clientSecret, useSandbox);
        }, 1000);
    };

    // Deinitialize the scoreflex SDK
    //   1. Buttons state is reset
    //   2. The realtime session is destroyed
    //   3. The scoreflex object is destroyed
    var deinitializeSDK = function() {
        logInfo("Scoreflex SDK deinitializing...");
        restartButtonEl.className  = "enabled";
        restartButtonEl.onclick    = function() { initializeSDK(); };
        stopButtonEl.className     = "disabled";
        stopButtonEl.onclick       = null;
        profileButtonEl.className  = "disabled";
        profileButtonEl.onclick    = null;
        stopRealtimeSession();
        scoreflex.destroy();
        scoreflex = null;
        logInfo("Scoreflex SDK deinitialized");
    };

    // Retrieve the realtime session and initialize it
    //   1. Retrieve the realtime session for the current player
    //   2. Initialize it and wait the result
    var startRealtimeSession = function() {
        logInfo("Scoreflex realtime session initializing...");
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
        logInfo("Scoreflex realtime session deinitializing...");
        if (realtimeSession) {
            scoreflex.destroyRealtimeSession();
        }
        realtimeSession = null;
    }

    /**********************************************************************/
    /**************************** Event listeners *************************/
    /**********************************************************************/
    // Main scoreflex event handler:
    //   - catch the scorefles SDK initialization result, the 'session' events
    //   - catch player login/logout, the 'player' events
    //
    // ignore 'challenge' and 'play' events for now.
    var scoreflexEventHandler = function(event) {
        var eventData = event.detail || {};

        // Handle session events
        if (eventData.name === 'session') {
            if (eventData.state === Scoreflex.SessionState.INIT_SUCCESS) {
                // The Scoreflex SDK was successfully initialized. Now, start
                // the realtime session.
                logInfo("Scoreflex SDK initialized");
                profileButtonEl.className = "enabled";
                profileButtonEl.onclick   = function() { scoreflex.Players.getCurrent().showProfile(); };
                startRealtimeSession();
            }
            else if (eventData.state === Scoreflex.SessionState.INIT_FAILED) {
                logInfo("Scoreflex SDK initialization failed");
                restartButtonEl.className = "enabled";
                restartButtonEl.onclick   = function() { initializeSDK(); };
                stopButtonEl.className    = "disabled";
                stopButtonEl.onclick      = null;
            }
        }

        // Handle player events
        else if (eventData.name === 'player') {
            logInfo(((eventData.anonymous === true) ? "Anonymous" : "Authenticated")
                    +" player logged-in");
            if (scoreflex.getSessionState() === Scoreflex.SessionState.INIT_SUCCESS) {
                // The scoreflex SDK was already initialized, so this event was
                // launched because the current player has changed. In this
                // situation, we destroy the current realtime session and start
                // a new one.
                logInfo("Current player has changed. Renew the realtime session");
                stopRealtimeSession();
                startRealtimeSession();
            }
        }
    };

    // Realtime session listener:
    //   - catch the realtime session initialization/deinitialization events
    var realtimeSessionInitializedListener = {
        onInitialized: function() {
            // The realtime session was successfully initialized, so we print
            // some information about it.
            logInfo("Scoreflex realtime session initialized\n"
                    + "  * Server address: "+realtimeSession.getServerAddr()+"\n"
                    + "  * Session options:\n"
                    + "      - Auto reconnection flag: "+realtimeSession.getReconnectFlag()+"\n"
                    + "      - Max retries:            "+realtimeSession.getMaxRetries()+"\n"
                    + "      - Reconnection timeout:   "+realtimeSession.getReconnectTimeout()+" msecs");

            // Set new buttons state
            restartButtonEl.className = "enabled";
            restartButtonEl.onclick   = function() { initializeSDK(); };
            stopButtonEl.className    = "enabled";
            stopButtonEl.onclick      = function() { deinitializeSDK(); };

            // ################################################################
            // THIS SAMPLE ENDS HERE. CHECKOUT 'realtime-connection-management'
            // SAMPLE FOR THE NEXT STEPS.
            // ################################################################
        },

        onInitializationFailed: function(status) {
            // The realtime session initialization failed
            switch (status) {
              case Scoreflex.Realtime.StatusCode.STATUS_NETWORK_ERROR:
                logInfo("Scoreflex realtime session initialization failed\n"
                        + "  (reason: Network error)");
                break;
              case Scoreflex.Realtime.StatusCode.STATUS_PERMISSION_DENIED:
                logInfo("Scoreflex realtime session initialization failed\n"
                        + "  (reason: Permission denied)\n");
                break;
              case Scoreflex.Realtime.StatusCode.STATUS_INTERNAL_ERROR:
                logInfo("Scoreflex realtime session initialization failed\n"
                        + "  (reason: Internal error)");
                break;
              default:
                logInfo("Scoreflex realtime session initialization failed\n"
                        + "  (reason: Unexpected error)");
            }
            restartButtonEl.className = "enabled";
            restartButtonEl.onclick   = function() { initializeSDK(); };
            stopButtonEl.className    = "disabled";
            stopButtonEl.onclick      = null;
        },

        onDeInitialized: function() {
            logInfo("Scoreflex realtime session deinitialized.\n");
            realtimeSession = null;
        }
    };

    /**********************************************************************/
    /************************* Object initialization **********************/
    /**********************************************************************/
    // Register The scoreflex event handler and initialiaze the scoreflex SDK
    listenEvent(window, 'ScoreflexEvent', scoreflexEventHandler);
    initializeSDK();

    // Export main objects for testing purpose
    this.scoreflex       = function() { return scoreflex; };
    this.realtimeSession = function() { return realtimeSession; };
})();
