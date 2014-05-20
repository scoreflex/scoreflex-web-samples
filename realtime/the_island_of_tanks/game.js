var myGame = new (function MyGame() {
    /**********************************************************************/
    /*********************** Scoreflex identifiers ************************/
    /**********************************************************************/
    // FILL THESE VARIABLES
    var clientId     = '...';
    var clientSecret = '...';
    var useSandbox   = true;
    var server       = {host: "...", port: ..., path: "..."};

    /**********************************************************************/
    /**************************** My variables ****************************/
    /**********************************************************************/
    // Define Scoreflex objects
    var scoreflex       = null;
    var realtimeSession = null;
    var island          = null;
    var load_timer      = null;

    /**********************************************************************/
    /*************************** Misc functions ***************************/
    /**********************************************************************/
    // Return the current time. Used to log messages
    var getTime = function() {
        var date = new Date();
        var time = date.toLocaleTimeString();
        var ms   = date.getMilliseconds();
        if (ms < 10)
            return ('['+time+ '.00'+ms+']');
        else if (ms < 100)
            return ('['+time+ '.0'+ms+']');
        return ('['+time+ '.'+ms+']');
    };

    // print log message, prefixed by the current time.
    var logInfo = function(msg) {
        console.log('%c'+getTime()+' %c'+msg, 'color:red;font-weight:bold', '');
    };

    // Show/hide messages & errors
    var hideMenu = function() {
        document.getElementById('title').className = 'hidden';
        document.getElementById('logo').className  = 'hidden';
        document.getElementById('menu').className  = 'hidden';
        document.getElementById('msg').className   = 'hidden';
        document.getElementById('msg').innerHTML   = '';
    };
    var showMenu = function() {
        document.getElementById('title').className = '';
        document.getElementById('logo').className  = '';
        document.getElementById('menu').className  = '';
        document.getElementById('msg').className   = 'hidden';
        document.getElementById('msg').innerHTML   = '';
    };
    var showMsg = function(msg) {
        document.getElementById('menu').className = 'hidden';
        document.getElementById('msg').className  = '';
        document.getElementById('msg').innerHTML  = msg;
    };
    var showError = function(msg) {
        showMsg(msg);
        document.getElementById('msg').className = 'error';
    };

    var hideWebview = function() {
        var el = document.getElementById('scoreflexWebClient_full');
        if (el) {
            document.body.removeChild(el);
        }
    };

    // Helper function to register a listener on a specified event target
    var listenEvent = function(element, eventType, handler) {
        if(element.addEventListener) {
            element.addEventListener(eventType, handler, false);
        }
        else if(element.attachEvent) {
            element.attachEvent( 'on' + eventType, handler);
        }
    };


    // Initialize the scoreflex SDK
    var initializeSDK = function() {
        if (scoreflex) {
            deinitializeSDK();
        }

        logInfo('Scoreflex SDK initializing...');
        hideWebview();

        setTimeout(function() {
            scoreflex = new Scoreflex(clientId, clientSecret, useSandbox);
        }, 1000);
    };

    // Deinitialize the scoreflex SDK
    var deinitializeSDK = function() {
        logInfo('Scoreflex SDK deinitializing...');
        stopRealtimeSession();
        scoreflex.destroy();
        scoreflex = null;
        logInfo('Scoreflex SDK deinitialized');
    };

    // Retrieve the realtime session and initialize it
    var startRealtimeSession = function() {
        logInfo('Scoreflex realtime session initializing...');
        realtimeSession = scoreflex.getRealtimeSession();
        if (!realtimeSession.isInitialized()) {
            realtimeSession.initialize2(server, realtimeSessionInitializedListener);
        }
        else {
            realtimeSessionInitializedListener.onInitialized();
        }
    };

    // Destroy the realtime session, if needed
    var stopRealtimeSession = function() {
        logInfo('Scoreflex realtime session deinitializing...');
        if (realtimeSession) {
            if (realtimeSession.isConnected()) {
                disconnectRealtimeSession();
            }
            scoreflex.destroyRealtimeSession();
        }
        realtimeSession = null;
    };

    var connectRealtimeSession = function() {
        realtimeSession.connect(connectionListener);
    };

    var disconnectRealtimeSession = function() {
        realtimeSession.disconnect();
        logInfo('Connection state: DISCONNECTED');
    };

    var loadRoomInfo = function(url, rooms) {
        if (rooms.length == 0) {
            var el = document.createElement('div');
            el.id  = 'newroom_item';
            if (rooms.length < 5) {
                el.className = 'item';
                el.onclick   = function() {
                    clearTimeout(load_timer);
                    createRoom();
                };
                el.innerHTML = '<span class="selected">&lt;</span>'
                    + 'Create a new room'
                    + '<span class="selected">&gt;</span>';
            }
            else {
                el.className = 'disabled_item';
                el.innerHTML = 'Create a new room (Server is full)';
            }
            document.getElementById('menu').appendChild(el);
            showMenu();
        }
        else {
            var handlers = {
                onload: function() {
                    if (!this.responseJSON) {
                        showError('FATAL ERROR:<br/>failed to retrieve rooms info.');
                        setTimeout(function() { loadMenu(); }, 2500);
                    }
                    else {
                        var room = this.responseJSON;
                        var name = room.id.replace(/_/g, ' ');
                        var el   = document.createElement('div');
                        el.id  = 'room_'+room.id;
                        if (room.players.length < room.config.maxPlayers) {
                            el.className = 'item';
                            el.onclick   = function() {
                                clearTimeout(load_timer);
                                joinRoom(room.id);
                            };
                            el.innerHTML = '<span class="selected">&lt;</span>'
                                + 'Join room "'+ name + '"'
                                + ' ('+ room.players.length +'/'+ room.config.maxPlayers +')'
                                + '<span class="selected">&gt;</span>';
                        }
                        else {
                            el.className = 'disabled_item';
                            el.innerHTML = name+' (Room is full)';
                        }
                        document.getElementById('menu').appendChild(el);
                        rooms.splice(0, 1);
                        loadRoomInfo(url, rooms);
                    }
                },
                onerror: function() {
                    showError('FATAL ERROR:<br/>failed to retrieve rooms info.');
                    setTimeout(function() { loadMenu(); }, 2500);
                }
            };
            ajax.get('room.yaws', {url: url, room: rooms[0]}, handlers, true);
        }
    };

    var loadMenu = function() {
        clearTimeout(load_timer);
        load_timer = setTimeout(function() { loadMenu(); }, 10000);
        showMsg('Loading...');
        document.getElementById('menu').innerHTML = '';

        if (realtimeSession.isConnected()) {
            var url = 'http://' + server.host + ':' + server.port + '/games/' + clientId;
            var handlers = {
                onload: function() {
                    if (!this.responseJSON) {
                        showError('FATAL ERROR:<br/>failed to retrieve rooms info.');
                        setTimeout(function() { loadMenu(); }, 2500);
                    }
                    else {
                        loadRoomInfo(url, this.responseJSON.rooms);
                    }
                },
                onerror: function() {
                    showError('FATAL ERROR:<br/>failed to retrieve rooms info.');
                    setTimeout(function() { loadMenu(); }, 2500);
                }
            };
            ajax.get('rooms.yaws', {url: url}, handlers, true);
        }
    };

    var createRoom = function() {
        var name  = get_random_entry(ISLANDS);
        var config = new Scoreflex.Realtime.RoomConfig(roomListener, messageListener);
        config.setMaxParticipants(32)
            .setMinParticipants(1)
            .setTickTime(100)
            .setAutoStart(false)
            .setAutoStop(false)
            .setJoinStrategy('anytime')
            .setServerScript('game.lua');

        var properties = {seed          : +(new Date()),
                          match_duration: 300000};

        showMsg('Loading...');
        realtimeSession.createRoom(name.replace(/ /g, '_'), config, properties);
    };

    var joinRoom = function(id) {
        realtimeSession.joinRoom(id, roomListener, messageListener);
    };

    var startGame = function() {
        var room   = realtimeSession.getCurrentRoom();
        var config = {me      : scoreflex.Players.getCurrent().getId(),
                      map_name: room.getId().replace(/_/g, ' '),
                      send_cb : sendMessage};

        // Get the room's properties (excluding players info) and create the
        // island object
        room.getProperties().forEach(function(n, v) {
            if (n.indexOf('player_') != 0)
                this[n] = v;
        }, config);

        island = new Island(config);

        var players      = {};
        var participants = room.getParticipants();
        for (var i = 0; i < participants.length; ++i) {
            var id   = participants[i];
            var info = room.getProperty('player_'+id);
            if (info == null)
                continue;
            info = info.split('#');
            var nickname = info[0];
            var hsv      = [+(info[1]), +(info[2]), +(info[3])];
            players[id]  = {nickname: nickname, hsv: hsv};
        }

        // Add me
        var nickname       = scoreflex.Players.getCurrent().getNickname();
        var hsv            = [Math.floor(360*Math.random()), Math.floor(100*Math.random()), 0];
        players[config.me] = {nickname: nickname, hsv: hsv};

        realtimeSession.setRoomProperty('player_'+config.me, nickname + '#' + hsv[0] + '#' + hsv[1] + '#' + hsv[2]);

        island.join(players);
        if (room.getMatchState() === Scoreflex.Realtime.MatchState.RUNNING) {
            island.start();
        }

        document.getElementById('leave_room').className = 'link';
        hideWebview();
        hideMenu();
    };

    var stopGame = function() {
        if (island) {
            island.destroy();
            island = null;
        }
        document.getElementById('leave_room').className = 'link hidden';
        showMenu();
        loadMenu();
    };

    /**********************************************************************/
    /**************************** Event listeners *************************/
    /**********************************************************************/
    // Main scoreflex event handler:
    //   - catch the scorefles SDK initialization result, the 'session' events
    //   - catch player login/logout, the 'player' events
    //
    // ignore 'play' events for now.
    var scoreflexEventHandler = function(event) {
        var eventData = event.detail || {};

        // Handle session events
        if (eventData.name === 'session') {
            if (eventData.state === Scoreflex.SessionState.INIT_SUCCESS) {
                // The Scoreflex SDK was successfully initialized. Now, start
                // the realtime session.
                logInfo('Scoreflex SDK initialized');
                startRealtimeSession();
            }
            else if (eventData.state === Scoreflex.SessionState.INIT_FAILED) {
                logInfo('Scoreflex SDK initialization failed');
                showError('FATAL ERROR:<br/>Scoreflex SDK initialization failed.');
            }
        }

        // Handle player events
        else if (eventData.name === 'player') {
            logInfo(((eventData.anonymous === true) ? 'Anonymous' : 'Authenticated')
                    +' player logged-in');
            if (scoreflex.getSessionState() === Scoreflex.SessionState.INIT_SUCCESS) {
                // The scoreflex SDK was already initialized, so this event was
                // launched because the current player has changed. In this
                // situation, we destroy the current realtime session and start
                // a new one.
                logInfo('Current player has changed. Renew the realtime session');
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
            logInfo('Scoreflex realtime session initialized\n'
                    + '  * Server address: '+realtimeSession.getServerAddr()+'\n'
                    + '  * Session options:\n'
                    + '      - Auto reconnection flag: '+realtimeSession.getReconnectFlag()+'\n'
                    + '      - Max retries:            '+realtimeSession.getMaxRetries()+'\n'
                    + '      - Reconnection timeout:   '+realtimeSession.getReconnectTimeout()+' msecs');

            connectRealtimeSession();
        },

        onInitializationFailed: function(status) {
            // The realtime session initialization failed
            switch (status) {
              case Scoreflex.Realtime.StatusCode.STATUS_NETWORK_ERROR:
                logInfo('Scoreflex realtime session initialization failed\n'
                        + '  (reason: Network error)');
                break;
              case Scoreflex.Realtime.StatusCode.STATUS_PERMISSION_DENIED:
                logInfo('Scoreflex realtime session initialization failed\n'
                        + '  (reason: Permission denied)\n');
                break;
              case Scoreflex.Realtime.StatusCode.STATUS_INTERNAL_ERROR:
                logInfo('Scoreflex realtime session initialization failed\n'
                        + '  (reason: Internal error)');
                break;
              default:
                logInfo('Scoreflex realtime session initialization failed\n'
                        + '  (reason: Unexpected error)');
            }
            showError('FATAL ERROR:<br/>Scoreflex realtime session initialization failed.');
            deinitializeSDK();
        },

        onDeInitialized: function() {
            logInfo('Scoreflex realtime session deinitialized.\n');
            realtimeSession = null;
        }
    };

    // Realtime connection listener:
    //   - catch connection status changes
    var connectionListener = {
        onConnected: function(info) {
            // New connection was opened. Print some information about the
            // session
            var sessInfo = {msg: ''};
            realtimeSession.getSessionInfo().forEach(function(k,v,t) {
                this.msg += '   * '+k+': '+v+'\n';
            }, sessInfo);
            logInfo('Connection state: CONNECTED\n'+sessInfo.msg);
            loadMenu();
        },
        onConnectionFailed: function(status) {
            logInfo('Connection state: DISCONNECTED\n'
                    + '  (connection failed - error: '+status+')');
            stopGame();
            showError('FATAL ERROR:<br/>Realtime connection failed');
            deinitializeSDK();
        },
        onConnectionClosed: function(status) {
            logInfo('Connection state: DISCONNECTED\n'
                    + '  (connection closed - reason: '+status+')');
            stopGame();
            showError('FATAL ERROR:<br/>Realtime connection closed');
            deinitializeSDK();
        },
        onReconnecting: function(status) {
            logInfo('Connection state: RECONNECTING\n'
                    + '  (reason: '+status+')');
        }
    };

    var roomListener = {
        onRoomCreated: function(status, room) {
            if (status === Scoreflex.Realtime.StatusCode.STATUS_SUCCESS) {
                logInfo('Room created');
                startGame();
            }
            else if (status === Scoreflex.Realtime.StatusCode.STATUS_ROOM_ALREADY_CREATED) {
                logInfo('Room already exsists. try another name');
                createRoom();
            }
            else {
                showError('FATAL ERROR:<br/>An error occured during<br/> room creation.');
                setTimeout(function() { loadMenu(); }, 2500);
            }
        },

        onRoomClosed: function(status, roomId) {
            stopGame();
            showMsg('Room was closed');
            setTimeout(function() { showMenu(); }, 1500);
        },

        onRoomJoined: function(status, room) {
            if (status === Scoreflex.Realtime.StatusCode.STATUS_SUCCESS) {
                logInfo('Room '+room.getId()+' joined');
                startGame();
            }
            else {
                showError('FATAL ERROR:<br/>Failed to join the room ');
                setTimeout(function() { loadMenu(); }, 2500);
            }
        },

        onRoomLeft: function(status, roomId) {
            island.leave();
            stopGame();
            showMsg('You left the room');
            setTimeout(function() { showMenu(); }, 1500);
        },

        onPeerJoined: function(room, peerId) {
        },

        onPeerLeft: function(room, peerId) {
            island.removePlayer(peerId);
        },

        onMatchStateChanged: function(status, room, oldState, newState) {
            if (newState === Scoreflex.Realtime.MatchState.RUNNING) {
                if (!island.isStarted()) {
                    island.start();
                }
            }
            if (newState === Scoreflex.Realtime.MatchState.FINISHED) {
                if (island.isStarted()) {
                    island.stop();
                }
            }
        },

        onRoomPropertyChanged: function(room, from, key) {
            if (key == ('player_'+from)) {
                var info = room.getProperty(key);
                if (info == null)
                    return;
                info = info.split('#');
                var nickname = info[0];
                var hsv      = [+(info[1]), +(info[2]), +(info[3])];
                island.addPlayer(from, nickname, hsv);
            }
        },

        onSetRoomPropertyFailed: function(status, room, key) {
        }
    };

    var messageListener = {
        onMessageReceived: function(room, from, tag, payload) {
            if (tag == 101) {
                island.addLogMessage(from, payload.get('quote'));
            }
            if (tag == 102) {
                island.addLogMessage(null, payload.get('msg'));
            }
            if (tag == 201) {
                payload.forEach(function(key, value) {
                    var type     = (key.split('_'))[0];
                    var id     = (key.split('_'))[1];
                    if (type == 'player') {
                        var info = value.split('#');
                        var position = {x         : +(info[0]),
                                        y         : +(info[1]),
                                        tank_pos  : +(info[2]),
                                        turret_pos: +(info[3]),
                                        shield    : +(info[4])};
                        this.setPlayerPosition(id, position);
                    }
                    else if (type == 'shell') {
                        var info = value.split('#');
                        var position = {x  : +(info[0]),
                                        y  : +(info[1]),
                                        pos: +(info[2])};
                        this.setShell(id, position);
                    }
                    else if (type == 'explosion') {
                        var info = value.split('#');
                        var position = {x : +(info[0]),
                                        y : +(info[1])};
                        var killer = info[2];
                        this.setExplosion(id, killer, position);
                    }
                    else if (type == 'hit') {
                        var info = value.split('#');
                        var position = {x : +(info[0]),
                                        y : +(info[1])};
                        this.setHit(id, position);
                    }
                    else if (type == 'missed') {
                        var info = value.split('#');
                        var position = {x : +(info[0]),
                                        y : +(info[1])};
                        this.setMissed(id, position);
                    }
                    else if (type == 'score') {
                        var info = value.split('#');
                        score = {frags : +(info[0]),
                                 deaths: +(info[1]),
                                 hits  : +(info[2]),
                                 shots : +(info[3])};
                        this.setScore(id, score);
                    }
                }, island);
            }
            if (tag == 202) {
                var countdown = payload.get('start_countdown');
                island.startCountdown(countdown);
            }
            if (tag == 203) {
                payload.forEach(function(key, value) {
                    var type     = (key.split('_'))[0];
                    var id     = (key.split('_'))[1];
                    if (type == 'score') {
                        var info = value.split('#');
                        score = {frags : +(info[0]),
                                 deaths: +(info[1]),
                                 hits  : +(info[2]),
                                 shots : +(info[3])};
                        this.setScore(id, score);
                    }
                }, island);
                island.refreshScores();
            }
        }
    };

    var sendMessage = function(peerId, tag, payload) {
        realtimeSession.sendUnreliableMessage(peerId, tag, payload);
    };

    /**********************************************************************/
    /************************* Object initialization **********************/
    /**********************************************************************/

    // Register The scoreflex event handler and initialiaze the scoreflex SDK
    listenEvent(window, 'ScoreflexEvent', scoreflexEventHandler);
    initializeSDK();

    window.onunload = function() { deinitializeSDK(); };

    this.showMyProfile = function() {
        var el = document.getElementById('scoreflexWebClient_full');
        if (el) {
            document.body.removeChild(el);
        }
        else {
            if (scoreflex) {
                scoreflex.Players.getCurrent().showProfile();
            }

            // Get page size
            var w = window;
            var d = document;
            var e = d.documentElement;
            var g = d.getElementsByTagName('body')[0];
            var pageX = w.innerWidth || e.clientWidth || g.clientWidth;
            var pageY = w.innerHeight|| e.clientHeight|| g.clientHeight;

            el = document.getElementById('scoreflexWebClient_full');
            el.style.left = (pageX/2 - 200) + 'px';
            el.style.top  = '20px';
        }
    };

    this.leaveRoom = function() {
        if (realtimeSession && realtimeSession.isConnected()) {
            realtimeSession.leaveRoom();
        }
    };

    this.showHelp = function() {
        var el = document.getElementById('help');
        el.className = (el.className == '') ? 'hidden' : '';
    };

    // Export main objects for testing purpose
    this.scoreflex       = function() { return scoreflex; };
    this.realtimeSession = function() { return realtimeSession; };
})();
