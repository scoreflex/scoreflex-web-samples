function Island(config) {
    /************ Private attributes ************/
    var started         = false;
    var simplexNoise    = null;
    var center          = {x: 0, y: 0};
    var players         = {count: 0};
    var shells          = {};
    var explosions      = {};
    var shots           = {hit: {}, missed: {}};
    var logs            = [];
    var keyPressed      = {cur: 0, prev: 0};
    var keyPressedTimer = null;

    var worldCanvas     = null;
    var viewportCanvas  = null;
    var miniMapCanvas   = null;
    var playersCanvas   = null;
    var scoresDiv       = null;
    var worldCtx        = null;
    var viewportCtx     = null;
    var miniMapCtx      = null;
    var playersCtx      = null;
    var viewportTileSize= 0;
    var miniMapTileSize = 0;

    /************ public methods ************/
    function start() {
        document.onkeydown = function(evt) {
            if (evt.keyCode == 37) {      // 'Left arrow' == TANK LEFT
                keyPressed.cur |= 1;
                return false;
            }
            else if (evt.keyCode == 38) { // 'Top arrow' == TANK TOP
                keyPressed.cur |= 2;
                return false;
            }
            else if (evt.keyCode == 39) { // 'Right arrow' == TANK RIGHT
                keyPressed.cur |= 4;
                return false;
            }
            else if (evt.keyCode == 40) { // 'Bottom arrow' == TANK BOTTOM
                keyPressed.cur |= 8;
                 return false;
            }
            else if (evt.keyCode == 83) { // 'S' == TURRET LEFT
                keyPressed.cur |= 16;
                return false;
            }
            else if (evt.keyCode == 68) { // 'D' == TURRET RIGHT
                keyPressed.cur |= 32;
                return false;
            }
            else if (evt.keyCode == 17) { // 'CTRL' == FIRE
                keyPressed.cur |= 64;
                return false;
            }
            else if (evt.keyCode == 9) {  // 'TAB' == SCORES
                scoresDiv.className = '';
                return false;
            }
        };

        document.onkeyup = function(evt) {
            if (evt.keyCode == 37) {
                keyPressed.cur &= (127 ^ 1);
                return false;
            }
            else if (evt.keyCode == 38) {
                keyPressed.cur &= (127 ^ 2);
                return false;
            }
            else if (evt.keyCode == 39) {
                keyPressed.cur &= (127 ^ 4);
                return false;
            }
            else if (evt.keyCode == 40) {
                keyPressed.cur &= (127 ^ 8);
                return false;
            }
            else if (evt.keyCode == 83) {
                keyPressed.cur &= (127 ^ 16);
                return false;
            }
            else if (evt.keyCode == 68) {
                keyPressed.cur &= (127 ^ 32);
                return false;
            }
            else if (evt.keyCode == 17) {
                keyPressed.cur &= (127 ^ 64);
                return false;
            }
            else if (evt.keyCode == 9) {
                scoresDiv.className = 'hidden';
                return false;
            }
        };

        scoresDiv.className = 'hidden';
        keyPressed = {cur: 0, prev: 0};
        keyPressedTimer = setInterval(function() {
            if (keyPressed.cur != keyPressed.prev) {
                keyPressed.prev = keyPressed.cur;
                payload = {key_pressed: keyPressed.cur};
                config.send_cb(null, 100, payload);
            }
        }, 20);

        started = true;
        setTimeout(renderLoop, 33);
    };

    function stop() {
        scoresDiv.className = '';
        document.onkeydown = null;
        document.onkeyup   = null;
        clearInterval(keyPressedTimer);
        started = false;

        for (var id in players) {
            players[id].position = null;
        }
        shells     = {};
        explosions = {};
        shots      = {hit: {}, missed: {}};
    };

    function destroy() {
        stop();
        miniMapCtx.clearRect (0, 0, miniMapCanvas.width,  miniMapCanvas.height);
        viewportCtx.clearRect(0, 0, viewportCanvas.width, viewportCanvas.height);
        playersCtx.clearRect (0, 0, playersCanvas.width,  playersCanvas.height);
        scoresDiv.className = 'hidden';
    };

    function join(users) {
        for (id in users) {
            var nick  = users[id].nickname;
            var hsv   = users[id].hsv;
            var rgb   = hsv2rgb(+(hsv[0]), +(hsv[1]), (+(hsv[2]) + 50) % 100);
            var color = 'rgba('+rgb[0]+', '+rgb[1]+', '+rgb[2]+', 1)';

            players.count++;
            players[id] = {nickname: users[id].nickname,
                           score   : {frags: 0, deaths: 0, hits: 0, shots: 0},
                           position: null,
                           color   : color,
                           tank    : makeTint(SPRITES.tank,   +(hsv[0]), +(hsv[1]), +(hsv[2])),
                           turret  : makeTint(SPRITES.turret, +(hsv[0]), +(hsv[1]), +(hsv[2]))};
        }

        var quote = get_random_entry(JOIN_QUOTES);
        config.send_cb(null, 101, {quote: quote});
        addLogMessage(config.me, quote);
    };

    function leave() {
        // FIXME: exit game quotes!
    };

    function addPlayer(id, nickname, hsv) {
        var rgb   = hsv2rgb(+(hsv[0]), +(hsv[1]), (+(hsv[2]) + 50) % 100);
        var color = 'rgba('+rgb[0]+', '+rgb[1]+', '+rgb[2]+', 1)';

        if (!players[id]) {
            addLogMessage(null, nickname+" enter the game");
            players.count++;
            players[id] = {position: null, score: {frags: 0, deaths: 0, hits: 0, shots: 0}};
        }
        players[id].nickname = nickname;
        players[id].color    = color;
        players[id].tank     = makeTint(SPRITES.tank,   +(hsv[0]), +(hsv[1]), +(hsv[2]));
        players[id].turret   = makeTint(SPRITES.turret, +(hsv[0]), +(hsv[1]), +(hsv[2]));
    };

    function removePlayer(id) {
        addLogMessage(null, players[id].nickname+" left the game");
        players.count--;
        delete players[id];
    };

    function setPlayerPosition(id, position) {
        if (!players[id])
            return;

        if (id == config.me) {
            center = position;
        }
        players[id].position = position;
    };

    function setShell(id, position) {
        shells[id] = {position: position};
    };

    function setExplosion(id, killer, position) {
        if (!players[id] || !players[killer])
            return;

        var msg = players[id].nickname+" was killed by "+players[killer].nickname;
        addLogMessage(null, msg);
        players[id].position = null;
        explosions[id] = {position: position, frame: 0};

        if (id == config.me && (Math.floor(Math.random() * 100) % 3) == 0) {
            var quote = get_random_entry(DEATH_QUOTES);
            quote = quote.replace("[enemy]", players[killer].nickname);
            config.send_cb(null, 101, {quote: quote});
            addLogMessage(id, quote);
        }
        else if (killer == config.me && (Math.floor(Math.random() * 100) % 3) == 0) {
            var quote = get_random_entry(KILL_QUOTES);
            quote = quote.replace("[enemy]", players[id].nickname);
            config.send_cb(null, 101, {quote: quote});
            addLogMessage(killer, quote);
        }
    };

    function setHit(id, position) {
        delete shells[id];
        shots.hit[id] = {position: position, frame: 0};
    };

    function setMissed(id, position) {
        delete shells[id];
        shots.missed[id] = {position: position, frame: 0};
    };

    function setScore(id, score) {
        if (players[id]) {
            players[id].score = score;
        }
    };

    function addLogMessage(from, log) {
        logs.push({ts: +(new Date()), from: from, log: log});
    };


    /************ Private methods ************/
    function getTileType(x, y) {
        var type = 'sand';
        var x1   = x - config.map_width/2;
        var y1   = y - config.map_height/2;
        var p = Math.pow(x1 / (config.map_width/2 - 8), 2) + Math.pow(y1 / (config.map_height/2 - 6), 2);
        if (p >= 1) {
            type = 'water';
        }
        else {
            var n = simplexNoise.noise2D(x * config.noise_factor, y * config.noise_factor);
            if (p > 0.8 && n > config.grass_threshold) {
                n = 0;
            }
            if (n < config.water_threshold) {
                type = 'water';
            }
            else if (n > config.grass_threshold) {
                type = 'grass';
            }
        }
        return type;
    };

    function getTile(x, y) {
        var tile;
        switch (getTileType(x, y)) {
          case 'sand':
            tile = TILES_SAND[0];
            break;
          case 'grass':
            var idx = 0;

            if (getTileType(x-1, y-1) == 'sand')
                idx |= 1;
            if (getTileType(x+1, y-1) == 'sand')
                idx |= 2;
            if (getTileType(x-1, y+1) == 'sand')
                idx |= 4;
            if (getTileType(x+1, y+1) == 'sand')
                idx |= 8;
            if (getTileType(x, y-1)   == 'sand')
                idx |= 3;
            if (getTileType(x-1, y)   == 'sand')
                idx |= 5;
            if (getTileType(x+1, y)   == 'sand')
                idx |= 10;
            if (getTileType(x, y+1)   == 'sand')
                idx |= 12;

            tile = TILES_GRASS[idx];
            break;
          case 'water':
            var idx = 0;

            if (getTileType(x-1, y-1) == 'sand')
                idx |= 1;
            if (getTileType(x+1, y-1) == 'sand')
                idx |= 2;
            if (getTileType(x-1, y+1) == 'sand')
                idx |= 4;
            if (getTileType(x+1, y+1) == 'sand')
                idx |= 8;
            if (getTileType(x, y-1)   == 'sand')
                idx |= 3;
            if (getTileType(x-1, y)   == 'sand')
                idx |= 5;
            if (getTileType(x+1, y)   == 'sand')
                idx |= 10;
            if (getTileType(x, y+1)   == 'sand')
                idx |= 12;

            tile = TILES_WATER[idx^15];
            break;
        }

        return tile;
    };

    function fillWorld() {
        var x = 0;
        var y = 0;
        var w = config.map_width;
        var h = config.map_height;
        for (var i = x; i < w; ++i) {
            for (var j = y; j < h; ++j) {
                var tile = getTile(i, j);
                worldCtx.drawImage(SPRITES.tiles,
                                   32 * tile.x, 32 * tile.y, 32, 32,
                                   config.tile_size * i, config.tile_size * j, config.tile_size, config.tile_size);
            }
        }
    };


    function renderLoop() {
        if (started == false)
            return;

        miniMapCtx.clearRect (0, 0, miniMapCanvas.width,  miniMapCanvas.height);
        viewportCtx.clearRect(0, 0, viewportCanvas.width, viewportCanvas.height);
        playersCtx.clearRect (0, 0, playersCanvas.width,  playersCanvas.height);

        drawMiniMap();

        var x = Math.min(worldCanvas.width - config.tile_size * config.viewport_x,
                         Math.max(0, center.x - config.tile_size * config.viewport_x / 2));
        var y = Math.min(worldCanvas.height - config.tile_size * config.viewport_y,
                         Math.max(0, center.y - config.tile_size * config.viewport_y / 2));

        drawViewport(x,y);
        for (var id in players) {
            if (players[id].position != null) {
                drawPlayer(id, x, y);
            }
        }
        for (var id in shells) {
            drawShell(id, x, y);
        }
        for (var id in explosions) {
            drawExplosion(id, x, y);
            explosions[id].frame++;
            if (explosions[id].frame == 33) {
                delete explosions[id];
            }
        }
        for (var id in shots.hit) {
            drawHitShot(id, x, y);
            shots.hit[id].frame++;
            if (shots.hit[id].frame == 24) {
                delete shots.hit[id];
            }
        }
        for (var id in shots.missed) {
            drawMissedShot(id, x, y);
            shots.missed[id].frame++;
            if (shots.missed[id].frame == 24) {
                delete shots.missed[id];
            }
        }

        var time = +(new Date());
        for (var i = logs.length-1, n = 0; i >= 0; i--) {
            if (logs[i].ts + 10000 < time) {
                logs.splice(i, 1);
            }
            else {
                showLog(logs[i].from, logs[i].log, ++n);
            }
        }

        refreshScores();

        setTimeout(renderLoop, 33);
    };

    function drawMiniMap() {
        var x,y,w,h;

        // Draw the mini map
        x = Math.max(0, center.x - 3 * config.tile_size * config.viewport_x / 2);
        y = Math.max(0, center.y - 3 * config.tile_size * config.viewport_y / 2);
        x = Math.min(worldCanvas.width - 3 * config.tile_size * config.viewport_x,  x);
        y = Math.min(worldCanvas.height - 3 * config.tile_size * config.viewport_y, y);
        w = 3 * config.tile_size * config.viewport_x;
        h = 3 * config.tile_size * config.viewport_y;

        miniMapCtx.drawImage(worldCanvas,
                             x, y, w, h,
                             0, 0, miniMapCanvas.width, miniMapCanvas.height);

        // Show players on the mini map
        for (var id in players) {
            if (players[id].position != null) {
                var x1 = (players[id].position.x - x) / config.tile_size;
                var y1 = (players[id].position.y - y) / config.tile_size;

                miniMapCtx.fillStyle = players[id].color;
                miniMapCtx.fillRect(miniMapTileSize * x1, miniMapTileSize * y1, 4, 4);

                miniMapCtx.strokeStyle = 'rgba(255,255,255,1)';
                miniMapCtx.strokeRect(miniMapTileSize * x1, miniMapTileSize * y1, 4, 4);
            }
        }

        // Report the viewport region on the mini mpa
        x = (center.x - x) / config.tile_size - config.viewport_x / 2;
        y = (center.y - y) / config.tile_size - config.viewport_y / 2;
        miniMapCtx.fillStyle = 'rgba(255,255,255,0.5)';
        miniMapCtx.fillRect(miniMapTileSize * x,
                            miniMapTileSize * y,
                            miniMapTileSize * config.viewport_x,
                            miniMapTileSize * config.viewport_y);

        miniMapCtx.textAlign    = 'left';
        miniMapCtx.textBaseline = 'middle';
        miniMapCtx.font         = 'bold 10pt Monospace';
        miniMapCtx.fillStyle    = 'white';
        miniMapCtx.fillText(config.map_name, 10, 10);
    };

    function drawViewport(x, y) {
        var w = config.tile_size * config.viewport_x;
        var h = config.tile_size * config.viewport_y;

        viewportCtx.drawImage(worldCanvas,
                              x, y, w, h,
                              0, 0, viewportCanvas.width, viewportCanvas.height);
    };

    function drawPlayer(id, x, y) {
        var f = 32/viewportTileSize;

        x = players[id].position.x - x - 110/(2*f);
        y = players[id].position.y - y - 91/(2*f);
        x *= viewportTileSize / config.tile_size;
        y *= viewportTileSize / config.tile_size;

        var tankX = 110 * (players[id].position.tank_pos % 16);
        var tankY = 91  * Math.floor(players[id].position.tank_pos / 16);
        playersCtx.drawImage(players[id].tank,
                             tankX, tankY, 110, 91,
                             x, y, 110/f, 91/f);

        var turretPos = (players[id].position.turret_pos+players[id].position.tank_pos) % 32;
        var turretX = 160 * (turretPos % 16);
        var turretY = 112 * Math.floor(turretPos / 16);
        playersCtx.drawImage(players[id].turret,
                             turretX, turretY, 160, 112,
                             x - 25/f, y - 25/f, 160/f, 112/f);


        playersCtx.fillStyle = 'rgba(255, 0, 0, 1)';
        playersCtx.fillRect(x + 15/f, y + 91/f, 80/f, 4/f);

        playersCtx.fillStyle = 'rgba(0, 0, 255, 1)';
        playersCtx.fillRect(x + 15/f, y + 91/f, (80/f) * (players[id].position.shield / config.tank_shield), 4/f);

        if (id != config.me) {
            playersCtx.font         = 'bold 8pt Monospace';
            playersCtx.fillStyle    = 'black';
            playersCtx.textAlign    = 'center';
            playersCtx.textBaseline = 'middle';
            playersCtx.fillText(players[id].nickname, x + 110/(2*f), y + 91/f + 10);
        }
    };

    function drawShell(id, x, y) {
        var f = 32/viewportTileSize;

        x = shells[id].position.x - x - 32/(2*f);
        y = shells[id].position.y - y - (32 + Math.abs(20 * Math.sin(shells[id].position.pos * Math.PI/16)))/(2*f);
        x *= viewportTileSize / config.tile_size;
        y *= viewportTileSize / config.tile_size;

        var shellX = 32 * shells[id].position.pos;
        var shellY = 0;
        playersCtx.drawImage(SPRITES.shell, shellX, shellY,  32, 32, x, y, 32/f, 32/f);
    };

    function drawExplosion(id, x, y) {
        var f = 32/viewportTileSize;

        x = explosions[id].position.x - x - 128/(2*f);
        y = explosions[id].position.y - y - 144/(2*f);
        x *= viewportTileSize / config.tile_size;
        y *= viewportTileSize / config.tile_size;

        var explosionX = 128 * (explosions[id].frame % 6);
        var explosionY = 144 * Math.floor(explosions[id].frame / 6);
        playersCtx.drawImage(SPRITES.explosion,
                             explosionX, explosionY,  128, 144,
                             x, y, 128/f, 144/f);
    };

    function drawHitShot(id, x, y) {
        var f = 32/viewportTileSize;

        x = shots.hit[id].position.x - x - 32/(2*f);
        y = shots.hit[id].position.y - y - 32/(2*f);
        x *= viewportTileSize / config.tile_size;
        y *= viewportTileSize / config.tile_size;

        var hitX = 32 * Math.floor(shots.hit[id].frame/2);
        var hitY = 0;

        var tileType = getTileType(shots.hit[id].position.x / config.tile_size,
                                   shots.hit[id].position.y / config.tile_size);
        if (tileType == 'water') {
            playersCtx.drawImage(SPRITES.shotExplosionWater,
                                 hitX, hitY,  32, 32,
                                 x, y, 32/f, 32/f);
        }
        else {
            playersCtx.drawImage(SPRITES.shotExplosion,
                                 hitX, hitY,  32, 32,
                                 x, y, 32/f, 32/f);
        }
    };

    function drawMissedShot(id, x, y) {
        var f = 32/viewportTileSize;

        x = shots.missed[id].position.x - x - 32/(2*f);
        y = shots.missed[id].position.y - y - 32/(2*f);
        x *= viewportTileSize / config.tile_size;
        y *= viewportTileSize / config.tile_size;

        var missedX = 32 * Math.floor(shots.missed[id].frame/2);
        var missedY = 0;

        var tileType = getTileType(shots.missed[id].position.x / config.tile_size,
                                   shots.missed[id].position.y / config.tile_size);
        if (tileType == 'water') {
            playersCtx.drawImage(SPRITES.shotExplosionWater,
                                 missedX, missedY,  32, 32,
                                 x, y, 32/f, 32/f);
        }
        else {
            playersCtx.drawImage(SPRITES.shotExplosion,
                                 missedX, missedY,  32, 32,
                                 x, y, 32/f, 32/f);
        }
    };

    function refreshScores() {
        var a = [];
        for (var id in players) {
            if (players[id].score == null)
                continue;
            var score    = players[id].score;
            var cls      = (id == config.me) ? 'class="me"' : '';
            var accuracy = (score.hits) ? Math.round(100*score.hits/score.shots) : 0;
            var html =
                '<div id="scores_player" '+cls+'>' +
                '  <span class="color" style="background-color:'+players[id].color+'">&nbsp;</span>' +
                '  <span class="name">'+players[id].nickname+'</span>' +
                '  <span class="frags">'+score.frags+'</span>' +
                '  <span class="deaths">'+score.deaths+'</span>' +
                '  <span class="accuracy">'+accuracy+'%</span>' +
                '</div>';
            a.push({frags: score.frags, deaths: score.deaths, accuracy: accuracy, html: html});
        }
        a.sort(function(s1, s2) {
            if (s1.frags == s2.frags) {
                if (s1.deaths == s2.deaths) {
                    return (s2.accuracy - s1.accuracy);
                }
                return (s1.deaths  - s2.deaths);
            }
            return (s2.frags  - s1.frags);
        });
        var el = document.getElementById('scores_players');
        el.innerHTML = '';
        for (var i = 0; i < a.length; i++) {
            el.innerHTML += a[i].html;
        }
    };

    function startCountdown(N) {
        playersCtx.clearRect(0, 0, playersCanvas.width, playersCanvas.height);
        playersCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        playersCtx.fillRect(0, 0, playersCanvas.width, playersCanvas.height);

        playersCtx.font         = 'bold 30pt Monospace';
        playersCtx.fillStyle    = 'white';
        playersCtx.textAlign    = 'center';
        playersCtx.textBaseline = 'middle';

        if (players.count > 1) {
            var winner = config.me;
            for (var id in players) {
                if (players[id].score == null)
                    continue;

                var s1 = players[id].score;
                var s2 = players[winner].score;
                if (s1.frags != s2.frags) {
                    winner = (s1.frags > s2.frags) ? id : winner;
                    continue;
                }
                if (s1.deaths != s2.deaths) {
                    winner = (s1.deaths < s2.deaths) ? id : winner;
                    continue;
                }
                var a1 = players[id].score.hits/players[id].score.shots;
                var a2 = players[winner].score.hits/players[winner].score.shots;
                winner = (a1 > a2) ? id : winner;
            }
            playersCtx.fillText("Winner: "+players[winner].nickname, playersCanvas.width/2, playersCanvas.height/8);
        }

        var msg = "Next match in "+N+" seconds..."
        playersCtx.fillText(msg, playersCanvas.width/2, 7*playersCanvas.height/8);


    };

    function showLog(from, str, pos) {
        playersCtx.textAlign = 'left';
        playersCtx.font      = 'bold 10pt Monospace';
        if (!from) {
            playersCtx.fillStyle = 'black';
            playersCtx.fillText(str, 10, playersCanvas.height - pos * 12);
        }
        else if (players[from]) {
            var from = (from == config.me) ? "You: " : players[from].nickname+": ";
            playersCtx.fillStyle = 'black';
            playersCtx.fillText(from, 10, playersCanvas.height - pos * 12);

            var sz = playersCtx.measureText(from).width;
            playersCtx.fillStyle = 'blue';
            playersCtx.fillText(str, 10+sz, playersCanvas.height - pos * 12);
        }
    };

    function init() {
        // Get page size
        var w = window;
        var d = document;
        var e = d.documentElement;
        var g = d.getElementsByTagName('body')[0];
        var pageX = w.innerWidth || e.clientWidth || g.clientWidth;
        var pageY = w.innerHeight|| e.clientHeight|| g.clientHeight;

        // Initialize canvas & DOM elements used by the game
        worldCanvas        = document.createElement('canvas');
        worldCanvas.width  = config.tile_size * config.map_width;
        worldCanvas.height = config.tile_size * config.map_height;
        worldCtx           = worldCanvas.getContext('2d');

        viewportTileSize = config.tile_size;
        while ((viewportTileSize * config.viewport_x) > pageX &&
               (viewportTileSize * config.viewport_y) > pageY) {
            viewportTileSize--;
        }

        viewportCanvas            = document.getElementById('viewport');
        viewportCanvas.width      = viewportTileSize * config.viewport_x;
        viewportCanvas.height     = viewportTileSize * config.viewport_y;
        viewportCanvas.style.top  = (pageY/2 - viewportCanvas.height/2) + 'px';
        viewportCanvas.style.left = (pageX/2 - viewportCanvas.width/2) + 'px';
        viewportCtx               = viewportCanvas.getContext('2d');

        scoresDiv              = document.getElementById('scores');
        scoresDiv.style.width  = '600px';
        scoresDiv.style.height = '400px';
        scoresDiv.style.top    = (pageY/2 - 200) + 'px';
        scoresDiv.style.left   = (pageX/2 - 300) + 'px';

        miniMapTileSize          = viewportTileSize / 16;
        miniMapCanvas            = document.getElementById('minimap');
        miniMapCanvas.width      = 3 * miniMapTileSize * config.viewport_x;
        miniMapCanvas.height     = 3 * miniMapTileSize * config.viewport_y;
        miniMapCanvas.style.top  = (pageY/2 - viewportCanvas.height/2 + 10)  + 'px';
        miniMapCanvas.style.left = (pageX/2 - viewportCanvas.width/2 + 10) + 'px';
        miniMapCtx               = miniMapCanvas.getContext('2d');

        playersCanvas            = document.getElementById('players');
        playersCanvas.width      = viewportCanvas.width;
        playersCanvas.height     = viewportCanvas.height;
        playersCanvas.style.top  = (pageY/2 - playersCanvas.height/2) + 'px';
        playersCanvas.style.left = (pageX/2 - playersCanvas.width/2) + 'px';
        playersCtx               = playersCanvas.getContext('2d');

        // Convert the seed and initialize the simplex noise object
        if (config.seed instanceof dcodeIO.Long) {
            config.seed = config.seed.toNumber();
        }
        simplexNoise = new SimplexNoise(config.seed);

        fillWorld();
    };

    /*********************************************************************/
    // Initialize this object
    init();

    // Export public methods
    this.start             = start;
    this.stop              = stop;
    this.destroy           = destroy;
    this.join              = join;
    this.leave             = leave;
    this.isStarted         = function() { return started; };
    this.addPlayer         = addPlayer;
    this.removePlayer      = removePlayer;
    this.setPlayerPosition = setPlayerPosition;
    this.setShell          = setShell;
    this.setExplosion      = setExplosion;
    this.setHit            = setHit;
    this.setMissed         = setMissed;
    this.setScore          = setScore;
    this.addLogMessage     = addLogMessage;
    this.refreshScores     = refreshScores;
    this.startCountdown    = startCountdown;
};
