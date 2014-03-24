function Card(num, suit) {
    this.num  = num;
    this.suit = suit;
    this.img  = "./img/"+suit+num+".png";
};

function Deck(seed) {
    var cards     = new Array(52);
    var seeder    = new Math.seedrandom(seed);
    var next_card = 0;

    for (i=1; i<14; i++) {
        cards[i-1] = new Card(i,"c");
        cards[i+12] = new Card(i,"h");
        cards[i+25] = new Card(i,"s");
        cards[i+38] = new Card(i,"d");
    }

    this.shuffle = function() {
        for (i=1; i < 1000; i++) {
            card1 = Math.floor(52 * seeder());
            card2 = Math.floor(52 * seeder());
            temp = cards[card2];
            cards[card2] = cards[card1];
            cards[card1] = temp;
        }
        next_card = 0;
    };

    this.dealCard = function() {
        if (next_card > 39) {
            this.shuffle();
        }
        return cards[next_card++];
    };
};

function handValue(hand) {
    var total = 0;
    var soft  = 0;
    var pips  = 0;
    for (var i = 0; i < hand.length; ++i ) {
        pips = hand[i].num;
        if (pips == 1) {
            soft  += 1;
            total += 11;
        }
        else {
            total += ((pips == 11 || pips == 12 || pips == 13 ) ? 10 : pips);
        }
    }
    while (soft > 0 && total > 21) {
        total -= 10;
        soft  -= 1;
    }
    return total;
};


function BJPlayer(game) {
    var scoreflex = game.scoreflex();
    var hand      = null;
    var inGame    = false;
    var table     = null;
    var timer     = null;
    var score     = 0;

    var init = function() {
        hand   = new Array();
        inGame = false;
        table  = null;
        timer  = null;
        score  = 0;

        document.getElementById("playerScore").innerHTML     = score;
        document.getElementById("playerHand").innerHTML      = "";
        document.getElementById("playerHandValue").innerHTML = "";

        var el = document.createElement("img");
        el.src = scoreflex.Players.getCurrent().getAvatarUrl();
        document.getElementById("playerAvatar").appendChild(el);
    };

    var deinit = function() {
        hand   = null;
        inGame = false;
        table  = null;
        timer  = null;
        score  = 0;

        document.getElementById("playerScore").innerHTML     = 0;
        document.getElementById("playerHand").innerHTML      = "";
        document.getElementById("playerAvatar").innerHTML    = "";
        document.getElementById("playerHandValue").innerHTML = "";
    };

    var getId = function() {
        return scoreflex.Players.getCurrent().getId();
    };

    var dropHand = function() {
        document.getElementById("playerHandValue").innerHTML = "";
        document.getElementById("playerHand").innerHTML      = "";
        hand = new Array();
    };

    var startGame = function(tbl) {
        document.getElementById("result").innerHTML     = "";
        document.getElementById("hitBtn").className     = "disabled";
        document.getElementById("standBtn").className   = "disabled";
        document.getElementById("giveUpBtn").className  = "enabled";
        document.getElementById("giveUpBtn").onclick    = function() { giveUp() };
        inGame = true;
        table  = tbl;
    };

    var stopGame = function() {
        document.getElementById("hitBtn").className     = "disabled";
        document.getElementById("standBtn").className   = "disabled";
        document.getElementById("giveUpBtn").className  = "disabled";
        document.getElementById("giveUpBtn").onclick    = null;
        deinit();
    };

    var dealCard = function(card) {
        hand.push(card);
        document.getElementById("playerHandValue").innerHTML = handValue(hand);
        var el = document.createElement("img");
        el.src = card.img;
        document.getElementById("playerHand").appendChild(el);
    };

    var isInGame = function() {
        return inGame;
    };

    var startCountdown = function(n) {
        if (n > 0) {
            document.getElementById("countdown").innerHTML = n;
            timer = setTimeout(function() { startCountdown(n-1) }, 1000);
        }
        else {
            stand();
        }
    };

    var stopCountdown = function() {
        clearTimeout(timer);
        document.getElementById("countdown").innerHTML = "";
    }

    var play = function() {
        if (handValue(hand) > 21) {
            stand();
        }
        else {
            prepareTurn();
            startCountdown(15);
        }
    };

    var hit = function() {
        stopCountdown();
        inGame = true;
        finishTurn();
        game.onHit();
        table.hit(getId());
    };

    var stand = function() {
        stopCountdown();
        inGame = false;
        finishTurn();
        game.onStand();
        table.stand(getId());
    };

    var giveUp = function() {
        stopCountdown();
        finishTurn();
        document.getElementById("giveUpBtn").className = "disabled";
        document.getElementById("giveUpBtn").onclick   = null;
        game.onGiveUp();
    };

    var prepareTurn = function() {
        document.getElementById("result").innerHTML   = "Your turn!";
        document.getElementById("hitBtn").className   = "enabled";
        document.getElementById("standBtn").className = "enabled";
        document.getElementById("hitBtn").onclick     = function() { hit(); };
        document.getElementById("standBtn").onclick   = function() { stand(); };
    };

    var finishTurn = function() {
        document.getElementById("countdown").innerHTML = "";
        document.getElementById("result").innerHTML    = "";
        document.getElementById("hitBtn").onclick      = null;
        document.getElementById("standBtn").onclick    = null;
        document.getElementById("hitBtn").className    = "disabled";
        document.getElementById("standBtn").className  = "disabled";
    };

    var winner = function() {
        document.getElementById("playerHandValue").innerHTML = handValue(hand);
        document.getElementById("playerScore").innerHTML = ++score;
        finishTurn();
        document.getElementById("result").innerHTML = "You win!";
        game.onWin();
    };

    var looser = function() {
        document.getElementById("playerHandValue").innerHTML = handValue(hand);
        finishTurn();
        document.getElementById("result").innerHTML = "You loose!";
        game.onLoose();
    };

    init();

    this.startGame    = startGame;
    this.stopGame     = stopGame;
    this.play         = play;
    this.getId        = getId;
    this.dropHand     = dropHand;
    this.dealCard     = dealCard;
    this.isInGame     = isInGame;
    this.winner       = winner;
    this.looser       = looser;
    this.getHandValue = function() { return handValue(hand); };
    this.getScore     = function() { return score; };
};

function BJIA(game) {
    var id     = 0;
    var hand   = null;
    var inGame = false;
    var table  = null;
    var score  = 0;

    var init = function() {
        id     = +new Date();
        hand   = new Array();
        inGame = false;
        table  = null;
        score  = 0;

        document.getElementById("opponentScore").innerHTML     = score;
        document.getElementById("opponentHand").innerHTML      = "";
        document.getElementById("opponentHandValue").innerHTML = "";

        var el = document.createElement("img");
        el.src = "./img/default_user.png";
        document.getElementById("opponentAvatar").appendChild(el);
    };

    var deinit = function() {
        id     = 0;
        hand   = null;
        inGame = false;
        table  = null;
        score  = 0;

        document.getElementById("opponentScore").innerHTML     = score;
        document.getElementById("opponentHand").innerHTML      = "";
        document.getElementById("opponentAvatar").innerHTML    = "";
        document.getElementById("opponentHandValue").innerHTML = "";
    };

    var getId = function() {
        return id;
    };

    var dropHand = function() {
        document.getElementById("opponentHandValue").innerHTML = "";
        document.getElementById("opponentHand").innerHTML      = "";
        hand = new Array();
    };

    var startGame = function(tbl) {
        inGame = true;
        table  = tbl;
    };

    var stopGame = function() {
        deinit();
    };

    var dealCard = function(card) {
        hand.push(card);
        var el = document.createElement("img");
        el.src = ((hand.length == 1) ? "./img/back.png" : card.img);
        document.getElementById("opponentHand").appendChild(el);
    };

    var isInGame = function() {
        return inGame;
    };

    var play = function() {
        if (handValue(hand) < 17) {
            inGame = true;
            setTimeout(function() { table.hit(getId()); }, 1500);
        }
        else {
            inGame = false
            setTimeout(function() { table.stand(getId()); }, 1500);
        }
    };

    var winner = function() {
        document.getElementById("opponentHandValue").innerHTML = handValue(hand);
        document.getElementById("opponentScore").innerHTML  = ++score;
        var el = document.getElementById("opponentHand").children[0];
        el.src = hand[0].img;
    };

    var looser = function() {
        document.getElementById("opponentHandValue").innerHTML = handValue(hand);
        var el = document.getElementById("opponentHand").children[0];
        el.src = hand[0].img;
    };

    init();

    this.startGame    = startGame;
    this.stopGame     = stopGame;
    this.play         = play;
    this.getId        = getId;
    this.dropHand     = dropHand;
    this.dealCard     = dealCard;
    this.isInGame     = isInGame;
    this.winner       = winner;
    this.looser       = looser;
    this.getHandValue = function() { return handValue(hand); };
    this.getScore     = function() { return score; };
};


function BJOpponent(id, game) {
    var scoreflex = game.scoreflex();
    var hand      = null;
    var inGame    = false;
    var table     = null;
    var timer     = null;
    var score     = 0;

    var init = function() {
        hand   = new Array();
        inGame = false;
        table  = null;
        timer  = null;
        score  = 0;
        document.getElementById("opponentScore").innerHTML     = score;
        document.getElementById("opponentHand").innerHTML      = "";
        document.getElementById("opponentHandValue").innerHTML = "";

        var handler = {
            onload: function(player) {
                var el = document.createElement("img");
                el.src = player.getAvatarUrl();
                document.getElementById("opponentAvatar").appendChild(el);
            },
            onerror: function() {
                var el = document.createElement("img");
                el.src = "./img/default_user.png";
                document.getElementById("opponentAvatar").appendChild(el);
            }
        };
        scoreflex.Players.get(id, {}, handler);
    };

    var deinit = function() {
        hand   = null;
        inGame = false;
        table  = null;
        timer  = null;
        score  = 0;

        document.getElementById("opponentScore").innerHTML     = score;
        document.getElementById("opponentHand").innerHTML      = "";
        document.getElementById("opponentAvatar").innerHTML    = "";
        document.getElementById("opponentHandValue").innerHTML = "";
    };

    var getId = function() {
        return id;
    };

    var dropHand = function() {
        document.getElementById("opponentHandValue").innerHTML = "";
        document.getElementById("opponentHand").innerHTML      = "";
        hand = new Array();
    };

    var startGame = function(tbl) {
        inGame = true;
        table  = tbl;
    };

    var stopGame = function() {
        deinit();
    };

    var dealCard = function(card) {
        hand.push(card);
        var el = document.createElement("img");
        el.src = ((hand.length == 1) ? "./img/back.png" : card.img);
        document.getElementById("opponentHand").appendChild(el);
    };

    var isInGame = function() {
        return inGame;
    };

    var play = function() {
    };

    var hit = function() {
        inGame = true;
        table.hit(getId());
    };

    var stand = function() {
        inGame = false;
        table.stand(getId());
    };

    var winner = function() {
        document.getElementById("opponentHandValue").innerHTML = handValue(hand);
        document.getElementById("opponentScore").innerHTML  = ++score;
        var el = document.getElementById("opponentHand").children[0];
        el.src = hand[0].img;
    };

    var looser = function() {
        document.getElementById("opponentHandValue").innerHTML = handValue(hand);
        var el = document.getElementById("opponentHand").children[0];
        el.src = hand[0].img;
    };

    init();

    this.startGame    = startGame;
    this.stopGame     = stopGame;
    this.play         = play;
    this.getId        = getId;
    this.dropHand     = dropHand;
    this.dealCard     = dealCard;
    this.isInGame     = isInGame;
    this.winner       = winner;
    this.looser       = looser;
    this.hit          = hit;
    this.stand        = stand;
    this.getHandValue = function() { return handValue(hand); };
    this.getScore     = function() { return score; };
};


function BJTable(players, seed) {
    var deck   = null;
    var nbTurns = 0;

    var init = function() {
        deck = new Deck(seed);
        deck.shuffle();
        nbTurns = 0;
    };

    var start = function() {
        document.getElementById("menu").className  = "hidden";
        document.getElementById("table").className = "";

        // Drop hands of all players
        for (var i = 0; i < players.length; ++i) {
            players[i].dropHand();
        }
        for (var i = 0; i < players.length; ++i) {
            players[i].dealCard(deck.dealCard());
        }
        for (var i = 0; i < players.length; ++i) {
            players[i].dealCard(deck.dealCard());
        }
        for (var i = 0; i < players.length; ++i) {
            players[i].startGame(this);
        }
        nbTurns++;
        turn(0);
    };

    var stop = function() {
        for (var i = 0; i < players.length; ++i) {
            players[i].stopGame();
        }
        document.getElementById("menu").className  = "";
        document.getElementById("table").className = "hidden";
    };


    var turn = function(idx) {
        if (idx >= players.length) {
            var eog = true;
            for (var i = 0; i < players.length; ++i) {
                if (players[i].isInGame() === true)
                    eog = false;
            }
            endOfTurn(eog);
        }
        else if (players[idx].isInGame() === true) {
            players[idx].play();
        }
        else {
            turn(idx+1);
        }
    };

    var endOfTurn = function(isFinished) {
        if (isFinished === false) {
            turn(0);
            return;
        }
        var max = 0;
        for (var i = 0; i < players.length; ++i) {
            var v = players[i].getHandValue();
            if (v <= 21 && v > max) {
                max = v;
            }
        }
        for (var i = 0; i < players.length; ++i) {
            var v = players[i].getHandValue();
            if (v > 21 || v < max) {
                players[i].looser();
            }
            else {
                players[i].winner();
            }
        }
    };

    var hit = function(id) {
        for (var i = 0; i < players.length; ++i) {
            if (players[i].getId() === id) {
                players[i].dealCard(deck.dealCard());
                turn(i+1);
            }
        }
    };

    var stand = function(id) {
        for (var i = 0; i < players.length; ++i) {
            if (players[i].getId() === id) {
                turn(i+1);
            }
        }
    };

    init();

    this.start   = start;
    this.stop    = stop;
    this.hit     = hit;
    this.stand   = stand;
    this.getTurn = function() { return nbTurns; };
};
