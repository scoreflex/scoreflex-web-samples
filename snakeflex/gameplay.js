Game.Gameplay = function() {
  /* DOM object references */
  var DOM_startSolo = document.getElementById("startSolo");
  var DOM_startChallenge = document.getElementById("startChallenge");
  var DOM_showLeaderboard = document.getElementById("showLeaderboard");
  var DOM_game_canvas = document.getElementById("game_canvas");
  var DOM_game_time = document.getElementById("game_time");
  var DOM_game_score = document.getElementById("game_score");
  var DOM_score_hub_value = document.getElementById("score_hub_value");
  var DOM_score_restart = document.getElementById("score_restart");

  var COLOR_CANVAS_BG = '#3a78ae';
  var COLOR_CANVAS_TEXT = '#FFFFFF';
  var COLOR_CANVAS_FOOD = '#d14d42';
  var COLOR_CANVAS_SNAKE = '#F4F4F4';

  var GAME_DURATION = 30000;

  var MODE_SOLO = 'solo';
  var MODE_CHALLENGE = 'challenge';

  var context = {
    score:0,
    mode: null,
    params: {}
  };

  /*******************/
  /** SCENE GLOBAL **/
  /*****************/
  var scene_show = function(scene_id) {
    var scene_ids = ['scene_menu', 'scene_game', 'scene_score'];
    var scene;
    for (var i=0; i<scene_ids.length; i++) {
      scene = document.getElementById(scene_ids[i]);
      scene.style.display = (scene_ids[i] === scene_id ? "block" : "none");
    }
  };

  /*****************/
  /** SCENE MENU **/
  /***************/
  var startSolo = function() {
    menu_quit();
    context.mode = MODE_SOLO;
    game_enter();
  };
  var loadLevel = function() {
    startSolo();
  };
  var showLeaderboard = function() {
    Social.showLeaderboard();
  };
  var startChallenge = function() {
    Social.showChallenges();
  };
  var loadChallenge = function(challenge) {
    console.log(challenge);
    Social.getChallengeDetails(challenge, function() {
      var json = this.responseJSON;
      console.dir(json);
      if (json.status === "running") {
        var seed = json.seed || 248;
        context.params.seed = seed;

        menu_quit();
        context.mode = MODE_CHALLENGE;
        context.params = {
          challenge: challenge
        };
        game_enter();
      }
    });
  };

  var menu_enter = function() {
    scene_show("scene_menu");
    Game.Common.listenEvent(DOM_startSolo, 'click', startSolo);
    Game.Common.listenEvent(DOM_startChallenge, 'click', startChallenge);
    Game.Common.listenEvent(DOM_showLeaderboard, 'click', showLeaderboard);
    // reinit context
    context.score = 0;
    context.mode = null;
    context.params = {};
  };

  var menu_quit = function() {
    Game.Common.unlistenEvent(DOM_startSolo, 'click', startSolo);
    Game.Common.unlistenEvent(DOM_startChallenge, 'click', startChallenge);
    Game.Common.unlistenEvent(DOM_showLeaderboard, 'click', showLeaderboard);
  };


  /******************/
  /** SCENE SNAKE **/
  /****************/
  var game_enter = function() {
    setTimeout(window.focus, 100);
    scene_show("scene_game");
    game_tout();
  };

  var game_quit = function() {
    score_enter();
  };

  /******************/
  /** SCENE SCORE **/
  /****************/
  var score_enter = function() {
    scene_show("scene_score");

    if (context.mode === MODE_SOLO) {
      Social.showRankbox(context.score);
    }
    else if (context.mode === MODE_CHALLENGE) {
      Social.sendLeaderboardScore(context.score);
      Social.sendChallengeScore(context.params.challenge, context.score, function() {
        setTimeout(function(){
          Social.showChallenge(context.params.challenge);
        }, 1000);
      });
    }

    DOM_score_hub_value.innerHTML = context.score;

    Game.Common.listenEvent(DOM_score_restart, 'click', score_quit);
  };

  var score_quit = function() {
    Game.Common.unlistenEvent(DOM_score_restart, 'click', score_quit);
    Social.hideWebView();
    menu_enter();
  };


  /***************/
  /** GAMEPLAY **/
  /*************/

  /* CANVAS */
  var MAP_WIDTH    = 320;
  var MAP_HEIGHT   = 460;
  var CELL_WIDTH   = 10;
  var map_orig     = {x: 0, y: 0};
  var offscreen_ctx = null;
  var game_ctx = DOM_game_canvas.getContext('2d');

  var get_abs_cell = function(cell) {
    var x = cell.x;
    var y = cell.y;
    if (x < 0) x += (MAP_WIDTH/CELL_WIDTH);
    if (y < 0) y += (MAP_HEIGHT/CELL_WIDTH);
    x = x % (MAP_WIDTH/CELL_WIDTH);
    y = y % (MAP_HEIGHT/CELL_WIDTH);
    return {x: x, y: y};
  };

  var teleport_cell = function(cell) {
      var x = cell.x;
      var y = cell.y;
      return {x: x, y: y};
  };

  var translate_cell = function(cell) {
    var x = cell.x;
    var y = cell.y;
    return get_abs_cell({x: x, y: y});
  };

  var render_map = function() {
    if (offscreen_ctx === null) {
      offscreen_map = document.createElement("canvas");
      offscreen_ctx = offscreen_map.getContext('2d');
      offscreen_map.width  = MAP_WIDTH;
      offscreen_map.height = MAP_HEIGHT;

      offscreen_ctx.fillStyle = COLOR_CANVAS_BG;
      offscreen_ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    }
    map_orig.x = 0;
    map_orig.y = 0;
    game_ctx.drawImage(offscreen_map, 0, 0);
  };

  var render_txt = function(txt) {
    game_ctx.textBaseline = 'middle';
    game_ctx.textAlign    = 'center';
    game_ctx.fillStyle    = COLOR_CANVAS_TEXT;
    game_ctx.font         = 'bold 18px sans-serif';
    game_ctx.fillText(txt, MAP_WIDTH/2, MAP_HEIGHT/2);
  };


  var render_cell = function(cell, color) {
    cell = translate_cell(cell);
    game_ctx.fillStyle = color;
    game_ctx.fillRect(cell.x * CELL_WIDTH, cell.y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
    game_ctx.strokeStyle = COLOR_CANVAS_BG;
    game_ctx.strokeRect(cell.x * CELL_WIDTH, cell.y * CELL_WIDTH, CELL_WIDTH, CELL_WIDTH);
  };

  var render_snake = function(snake, color) {
    var cell = {x: snake.head.x, y: snake.head.y};
    render_cell(cell, color);
    cell = teleport_cell(cell);
    for (var i = 0; i < snake.body.length; ++i) {
      if      (snake.body[i] == 0) cell.x--;
      else if (snake.body[i] == 1) cell.y--;
      else if (snake.body[i] == 2) cell.x++;
      else if (snake.body[i] == 3) cell.y++;
      cell = get_abs_cell(teleport_cell(cell));
      render_cell(cell, color);
    }
  };

  /* GAME EVENTS */
  var TICK_TIME = 60;
  var game_state = {player:{}};
  var game_timer = null;
  var game_start_time = 0;
  var startingSeed = Math.random();
  var lastSeed = startingSeed;
  var seeder = new Math.seedrandom(lastSeed);

  var get_random_coords = function() {
    var cell = {x: 0, y: 0};
    cell.x = Math.floor((seeder() * (MAP_WIDTH / CELL_WIDTH - 1)));
    cell.y = Math.floor((seeder() * (MAP_HEIGHT / CELL_WIDTH - 1)));
    return cell;
  };

  var set_keyevent_handlers = function() {
    game_state.last_key  = 37;
    game_state.direction = 'right';
    document.onkeydown = function(evt) {
      if (evt.keyCode == 37 || evt.keyCode == 38 || evt.keyCode == 39 || evt.keyCode == 40) {
        game_state.last_key = evt.keyCode;
        return false;
      }
    };
  };

  var unset_keyevent_handlers = function() {
    document.onkeydown  = null;
    game_state.last_key = 0;
    game_state.direction= '';
  };

  function render() {
    render_map();
    render_snake(game_state.player.snake, COLOR_CANVAS_SNAKE);
    render_cell(game_state.food, COLOR_CANVAS_FOOD);
  };

  function game_update_food() {
    var cell = {x: 0, y: 0};
    seeder = new Math.seedrandom(lastSeed);
    cell.x = Math.floor(seeder() * MAP_WIDTH/CELL_WIDTH);
    cell.y = Math.floor(seeder() * MAP_HEIGHT/CELL_WIDTH);
    game_state.food = cell;
  };

  var game_update_player = function() {
    if (game_state.player.alive == false) {
      return;
    }

    if (game_state.last_key == 37 && game_state.direction != "right")
      game_state.direction = "left";
    else if (game_state.last_key == 38 && game_state.direction != "down")
      game_state.direction = "up";
    else if (game_state.last_key == 39 && game_state.direction != "left")
      game_state.direction = "right";
    else if (game_state.last_key == 40 && game_state.direction != "up")
      game_state.direction = "down";
    game_state.last_key = 0;

    var head = game_state.player.snake.head;
    var body = game_state.player.snake.body;

    // Update head position
    if      (game_state.direction == "right") head.x++;
    else if (game_state.direction == "left")  head.x--;
    else if (game_state.direction == "down")  head.y++;
    else if (game_state.direction == "up")    head.y--;

    head = get_abs_cell(teleport_cell(head));
    // eat food
    if (head.x == game_state.food.x && head.y == game_state.food.y) {
      lastSeed = seeder(); // choose the next seed
      seeder = new Math.seedrandom(lastSeed);
      game_state.player.score++;
      if      (game_state.direction == "right") body = "0"+body;
      else if (game_state.direction == "left")  body = "2"+body;
      else if (game_state.direction == "down")  body = "1"+body;
      else if (game_state.direction == "up")    body = "3"+body;
    }
    // go forward
    else if (body != "") {
      if      (game_state.direction == "right") body = "0"+body.slice(0, -1);
      else if (game_state.direction == "left")  body = "2"+body.slice(0, -1);
      else if (game_state.direction == "down")  body = "1"+body.slice(0, -1);
      else if (game_state.direction == "up")    body = "3"+body.slice(0, -1);
    }

    game_state.player.snake = {head: head, body: body};
  };

  var game_update_scores = function() {
    DOM_game_score.innerHTML = game_state.player.score;
  };

  var check_snake_body_collisions = function(cell, snake) {
    var head = get_abs_cell(snake.head);
    cell     = get_abs_cell(cell);
    for (var i = 0; i < snake.body.length; ++i) {
      if      (snake.body[i] == 0) head.x--;
      else if (snake.body[i] == 1) head.y--;
      else if (snake.body[i] == 2) head.x++;
      else if (snake.body[i] == 3) head.y++;
      head = get_abs_cell(head);
      if (head.x == cell.x && head.y == cell.y) {
        return true;
      }
    }
    return false;
  };

  var game_update_countdown = function() {
    var time = Math.max(0, Math.floor((GAME_DURATION - ((+new Date()) - game_start_time))/1000));
    DOM_game_time.innerHTML = time;
  };

  var is_end_of_game = function() {
    return (+new Date()) - game_start_time > GAME_DURATION;
  };

  var game_check_collisions = function() {
    var head = game_state.player.snake.head;
    return check_snake_body_collisions(head, game_state.player.snake);
  };

  var player_loop = function() {
    game_timer = setTimeout(player_loop, TICK_TIME);

    // check end of time or collision with self
    if (is_end_of_game() || game_check_collisions()) {
      game_stop();
      return;
    }

    game_update_food();
    game_update_player();

    render();
    game_update_scores();
    game_update_countdown();
  };

  var game_init = function() {
    startingSeed = context.params.seed || Math.random();
    lastSeed = startingSeed;
    seeder = new Math.seedrandom(lastSeed);

    DOM_game_canvas.width  = MAP_WIDTH;
    DOM_game_canvas.height = MAP_HEIGHT;
    DOM_game_score.innerHTML = 0;
    DOM_game_time.innerHTML = GAME_DURATION / 1000;

    game_state = {player:{}};
    game_state.player.snake = {head: get_random_coords(), body: "00"};
    game_state.player.score = 0;
    render_map();
  };

  var game_stop = function() {
    clearTimeout(game_timer);
    unset_keyevent_handlers();
    context.score = game_state.player.score;
    delete game_state;
    game_quit();
  };

  var game_tout = function() {
    game_init();
    setTimeout(function() {render_map();render_txt('Ready... 2');}, 0);
    setTimeout(function() {render_map();render_txt('Ready... 1');}, 1000);
    setTimeout(function() {render_map();game_start();}, 2000);
    //game_start();
  };

  function game_start() {
    setTimeout(game_run, 1000);
    render_txt('GO !!!!!!!!!!!!');
  };

  var game_run = function() {
    game_start_time = (+new Date());
    set_keyevent_handlers();
    game_timer = setTimeout(player_loop, TICK_TIME);
  };

  /* SOCIAL HANDLER */
  var Social = Game.Social({
    loadLevel:loadLevel,
    loadChallenge:loadChallenge
  });
  //Social.reset();


  /*****************/
  /** SCENE INIT **/
  /***************/
  menu_enter();

};
