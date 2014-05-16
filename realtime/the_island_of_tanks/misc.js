/***********************************************************************/
/***************************** Sprites *********************************/
/***********************************************************************/
var TILES_SAND  = [
    {x: 0, y: 0}
];
var TILES_WATER = [
    {x: 0, y: 0},  {x: 1, y: 0},  {x: 2, y: 0},  {x: 3, y: 0},
    {x: 4, y: 0},  {x: 5, y: 0},  {x: 6, y: 0},  {x: 7, y: 0},
    {x: 8, y: 0},  {x: 9, y: 0},  {x: 10, y: 0}, {x: 11, y: 0},
    {x: 12, y: 0}, {x: 13, y: 0}, {x: 14, y: 0}, {x: 15, y: 0}
];
var TILES_GRASS = [
    {x: 0, y: 1},  {x: 1, y: 1},  {x: 2, y: 1},  {x: 3, y: 1},
    {x: 4, y: 1},  {x: 5, y: 1},  {x: 6, y: 1},  {x: 7, y: 1},
    {x: 8, y: 1},  {x: 9, y: 1},  {x: 10, y: 1}, {x: 11, y: 1},
    {x: 12, y: 1}, {x: 13, y: 1}, {x: 14, y: 1}, {x: 0, y: 0}
];
var SPRITES = {
    tiles             : new Image(),
    tank              : new Image(),
    turret            : new Image(),
    shell             : new Image(),
    explosion         : new Image(),
    shotExplosion     : new Image(),
    shotExplosionWater: new Image()}

SPRITES.tiles.src              = 'img/sprite_tiles.png';
SPRITES.tank.src               = 'img/sprite_tank.png';
SPRITES.turret.src             = 'img/sprite_turret.png';
SPRITES.shell.src              = 'img/sprite_shell.png';
SPRITES.explosion.src          = 'img/sprite_explosion.png';
SPRITES.shotExplosion.src      = 'img/sprite_shot_missed.png';
SPRITES.shotExplosionWater.src = 'img/sprite_shot_missed_water.png';


/***********************************************************************/
/**************************** Rooms names ******************************/
/***********************************************************************/
var ISLANDS = [
    "Almaren",
    "Cair Andros",
    "Carrock",
    "Elvet-isle",
    "Enchanted Isles",
    "Ened",
    "Girdley Island",
    "Himring",
    "Isle of Balar",
    "Numenor",
    "Tol Brandir",
    "Tol Fuin",
    "Tol Galen",
    "Tol Morwen",
    "Tol Sirion",
    "Tol Uinen",
    "Tol-in-Gaurhoth",
    "Tolfalas",
    "Bhangbhangduc",
    "Brown Islands",
    "Foggy Islands",
    "Krull",
    "The Circumfence",
    "Sunken Leshp",
    "Mithos",
    "Mono Island",
    "Purdee Island",
    "Island of Slakki",
    "be Trobi Islands",
    "Ting Ling"
];

/***********************************************************************/
/***************************** Quotes **********************************/
/***********************************************************************/
var JOIN_QUOTES = [
    "Run for cover fighters! I'm back!",
    "Hi!",
    "Hello",
    "Hey there, ho there, hi there!",
    "I'll bet you missed me.",
    "G'day mates. Time to toss you on the barbie.",
    "wassup!",
    "Hey there!",
    "H'lo",
    "Howdy!",
    "Who's going to be the first to die?",
    "Konnichiwa",
    "No challenge here today.",
    "Time to party down!",
    "Awright!! I OWN this arena!",
    "Crap. Losers in here again!",
    "Yessss! New victims everywhere!",
    "I'm taking volunteers for target practice.",
    "It's showtime!",
    "Oh yeah! I'm so ready for this.",
    "Let's get it ON!",
    "Great! Nothing but easy frags here today.",
    "Hello. This is the voice of death speaking.",
    "Let's do it!",
    "Let's frag the losers and make 'em cry!",
    "Let's get rollin'!",
    "It's time for some fireworks.",
    "How much blood must I bathe in before I find peace?",
    "Aren't there supposed to be 'slipgates' here?",
    "WOW! Is the circus in town or something?",
    "I got me some primal urges to work here.",
    "Now that we are all here, let the lesson begin.",
    "Welcome unenlightened ones. Learn, and then die.",
    "The bee is drawn to the flower, yet the spider lurks below.",
    "Do I hear a sharp intake of breath? Did you not expect me?",
    "A mole tunnels endlessly to dig his warren. I command it; it is done.",
    "Today's lesson will be pain.",
    "Heh. Fresh Meat.",
    "Time to Rock 'n Roll.",
    "My wings do droop in anticipation.",
    "How many must I kill before my scale is balanced again?",
    "The call of the ages beckons me once again.",
    "Exterminate!",
    "Y'all got your boots on. Let's get busy.",
    "All the comforts of home and good company too.",
    "Y'all don't want to get on my bad side today.",
    "Konnichiwa, campers.",
    "Ooooo. Gimme some room, I feel a victory comin' on.",
    "My wetware is hot tonight!",
    "I'm ready to log in and get virtual.",
    "Been here, done this and am ready to do it again.",
    "Whoaaaa. I need a global positioning implant to find my way around in here."
];

var KILL_QUOTES = [
    "I easily slide the thread through the eye of the needle.",
    "You must learn to anticipate, little one.",
    "A clean kill. Rejoice, [enemy], for I was merciful.",
    "You die, [enemy]. Any way I choose.",
    "Often the master must take matters into his own 'hands'.",
    "The true warrior is a shadow within the darkness, a whisper among shouts.",
    "I am all about you, [enemy], omnipotent and ever-present.",
    "You see, [enemy]? The scorpion has a tail.",
    "Out of my way!",
    "It is good to know that there was nothing of significance blocking my entrance.",
    "They say there is honor in death. Do not believe them, [enemy].",
    "My soul for a true challenge!",
    "They waste my time by feeding me insects like you.",
    "The elephant steps on the ant. Does he even notice?",
    "You should die childless. Your existence insults the theory of evolution.",
    "There are among us those rare creatures who move better dead than alive.",
    "You lived as a coward, [enemy]. And you died as a coward.",
    "With you in mind, [enemy], I tremble at the concept of reincarnation.",
    "Fine is the line between risk and foolishness. You stepped too far, [enemy].",
    "Great is better than good. I win.",
    "Take heart, [enemy], for those who do not try, cannot win.",
    "For a brief moment, you were a true fighter, [enemy]. Sleep now, for that moment is passed.",
    "[enemy], you have rekindled my hope that one day I will be truly challenged.",
    "I have killed the likes of you a thousand times, [enemy]. Warriors who nearly made the grade.",
    "Woohoo! That was too easy. They're taking all the fun out of it.",
    "Choo choo! Train's coming through!",
    "In the old days, we cooked hot dogs like this.",
    "Gimme back my axe! I hate this thing.",
    "Way too easy.",
    "No challenge here.",
    "That's like putting an 8-track in a cassette deck!",
    "I'm a slip-gating fool! Wahoooo!",
    "I've had better fights trying to put my pants on in the middle of the night.",
    "I hate fraggin' them before they're old enough to drive.",
    "You old enough to be here, [enemy]? Can I see some ID.",
    "Come back when you've improved enough to be competition, [enemy].",
    "Age and treachery always overcome youth and skill. You bet!",
    "You done good, [enemy]. Too bad you won't get to polish your technique.",
    "You remind me of me in the old days ... course, I got better.",
    "You've been watching ol' Wrack's moves, right, [enemy]?",
    "Yessssss!!",
    "Gotcha!",
    "You're it!",
    "Thanks, [enemy]. I love doing that!",
    "Humiliation is the name of the game, kid.",
    "Stand aside, kid. Whoops. Too late.",
    "Nothing but memories left there.",
    "Pick up your toys and go home kid.",
    "I was told you were competition, [enemy]. Somebody got that wrong.",
    "Not bad, kid. Most don't last that long.",
    "Almost didn't get you there, kid.",
    "I prefer not this weapon, but neither would I waste my time in battling you, [enemy].",
    "Ignorance is bliss, but only if bliss is death.",
    "Sometimes it is preferable not to hear the serpent's rattle.",
    "Go home, puny one, this is not your place.",
    "I waste no ammo on the likes of you, [enemy].",
    "The touch of Death. Cold ...",
    "The fates have deemed you unworthy [enemy]... obviously.",
    "Just go away.",
    "Bah! Each new round brings an opponent less worthy.",
    "The ease of your execution only heightens my boredom, [enemy].",
    "I have forgotten your name already.",
    "Your race weakens with the eons... your ancestors would still be alive.",
    "There are many ways to die. I suspect that you have perfected them all, [enemy].",
    "In a thousand years, I have never seen one as pitiful as thee, [enemy].",
    "Too easy. Where has the challenge gone?",
    "Trust me, I have done you a favor and an honor, [enemy].",
    "If you so desire the life that I have known, try again. You may get there, [enemy].",
    "The Lords shall be grateful that I killed you. You would have brought them pain, [enemy].",
    "I will write your name in my great book ... that, I have not done for centuries untold.",
    "The Dark Angel of Death has spoken. Hear his voice!",
    "Show promise and learn well, and learn now that this is not the course for you, [enemy].",
    "Don't die, [enemy], Tankjr must run over you a few times.",
    "STATUS: 'Terminal Penetration of Opponent acheived.'",
    "TARGET TERMINATED",
    "SENSOR EVALUATION: 'Target data stream fatally interrupted.'",
    "ACQUIRING TARGET: 'Scan Failure. Cannot locate.",
    "The Strogg Empire will rise again.",
    "How do biological units live with the smell?",
    "DATA SEARCH: 'Cannot find praise string. Search aborted.",
    "I will keep your organs as a memento of this match, [enemy].",
    "Y'all give a new meaning to reach out and touch someone, [enemy].",
    "Gonna have me a weiner roast; no need to build a fire ...",
    "Get off my turf!",
    "There's one monkey off my back.",
    "Y'all can't nap in the stall like that, [enemy].",
    "I figured y'all forgot to flush, [enemy]. So I done it for y'all.",
    "The bugs in the kitchen gave me more of a fight than y'all did, [enemy].",
    "Let's hope you never go to prison.",
    "Yo, [enemy]! You take that target off when y'all sleep?",
    "Y'all Consider yourself honored. I'm a trained professional.",
    "Y'all were a worthy opponent, for an amateur.",
    "I love modern technology.",
    "So I'm a camper. Sue me.",
    "Nothing like a friendly touch to make a girl's day.",
    "I've got more where that came from.",
    "That was so wrong in all the right ways",
    "Too much data, not enough storage.",
    "I'm a terminal download!",
    "Wrongful!",
    "You dance really fine, babe. Just not fast enough.",
    "Nice moves, but not quick enough, [enemy].",
    "Hey, [enemy] Let's see you try that move with skates on.!"
];

var DEATH_QUOTES = [
    "You show promise, [enemy] ... perhaps too much so.",
    "Perhaps I have underestimated you, [enemy].",
    "You have touched perfection, [enemy]. Can you grab onto it?",
    "The snake can strike but once against the quick of hand.",
    "I feel the sting of an insignificant wasp, and yet, I fear I am allergic.",
    "You fear to face me openly, [enemy]? You are wise beyond your years.",
    "Your tactics offend the philosopher in me, [enemy].",
    "Chaos reigns when a gnat is given the power of the bear.",
    "I end in a green blaze. There could be no other way.",
    "The candle that burns twice as fast, burns twice as bright.",
    "Cowards cannot comprehend the joy of valor, [enemy].",
    "The weak can win ... once.",
    "It must be true: fate is a path of many unforeseeable twists and turns.",
    "When all logic is cast aside, and all reason is reduced to madness, there is chaos.",
    "Call the scribe. This is an occasion which you will want to remember, [enemy].",
    "Brief are those moments of insanity, fortunately. Enjoy yours, [enemy].",
    "Boast of this kill, [enemy]. It is the one mask to hide the fool that is you.",
    "There is no trophy greater. I pray you are worthy, [enemy].",
    "You are my peer, [enemy]. We are rare.",
    "I will see you on the higher level, [enemy].",
    "I salute you, [enemy], for magnificent deeds should not go unheralded.",
    "My corpse is my shrine. Build well your own, [enemy].",
    "You have taken a great step along the road to perfection.",
    "Charlie got tougher in the jungle.",
    "You just try that again when I'm drunk.",
    "Sissy gun! Sissy gun! We wouldn't use crap like that in the old days!",
    "Oh look, a viking burial! Hey wait, it's mine!",
    "Whose bright idea was this weapon?",
    "No-skill llama!",
    "What're the fireworks for, [enemy]? Ow...never mind.",
    "Four years ago, I could've killed you with a projectile-shaped piece of earwax.",
    "Yeah, in the old days, I had to walk a mile through six feet of snow to frag someone.",
    "They make things too easy now. Anybody can fight here.",
    "And the old stallion is driven from the herd...",
    "You fight like that for 30 years ... you just might be me someday.",
    "Nice. You trained with the 'old ones,' didn't you, [enemy]?",
    "Will you stop touching me?",
    "Do that again and you are toast.",
    "Heh. Nice shot kid.",
    "Did Xian show you how to do that?",
    "Meteor Shower from Hell!",
    "Got any ammo left, punk? You're gonna need it.",
    "Did you enjoy that?",
    "I'll bet you enjoyed that more than I did, [enemy].",
    "Oh, yeah. You had me good there kid.",
    "Not bad kid.",
    "Work on your follow through, kid.",
    "You copied that move from me, didn't you, [enemy]?",
    "Are you worthy to ascend, [enemy]? Or have I sunk so low?",
    "The ages have diminished the mighty to the level of ... [enemy].",
    "The mewling child dares swing at the father?",
    "I did not see it, [enemy]... that is preferred.",
    "How? Where? Nay, the question is 'why?'",
    "There is promise in one who displays such stealth, [enemy].",
    "Sudden and without warning, [enemy]... you have perfected one aspect of death.",
    "But how would you fight without such firepower, [enemy]?",
    "It is a challenge reduced to throw weight. There is no honor.",
    "Scatter me across all the world, [enemy].",
    "I pray that this mighty weapon is enough power to end my reign.",
    "Now you learn the truth, [enemy].",
    "Rejoice not, [enemy]. All victory is temporary.",
    "You are not worthy, [enemy]. You are merely lucky, and luck cannot hold.",
    "One frag does not an Arena Lord make, [enemy]!",
    "If only you understood the truth: that I let you win.",
    "Dance not, puny one. The eons felled me, not [enemy].",
    "What is it that you have truly won, [enemy]?",
    "Your cheers reveal your ignorance, [enemy].",
    "Attach my wings to your coil if you can [enemy]. Wear them with pride.",
    "My cycle is near completed. Yours is just begun, [enemy]. I pity you.",
    "Behold ye, the new Dark Angel of Death. Enjoy this time of ignorance.",
    "I fall to you, [enemy], but there are levels you must yet scale.",
    "I honor you in deaths prayer, [enemy] ... may your fall will be as swift as your rise.",
    "May death find you in battle, [enemy], and quickly, before you begin the long descent.",
    "Has the Arena found its next champion?",
    "WARNING: 'Grenade in the hatch! Grenade in the hatch!'",
    "SENSOR FAILURE: 'Target range undetermined.'",
    "PLAYBACK RECORDING:'You maggot-lapping piece of fly snot!'",
    "PLAYBACK RECORDING: 'Ow. That really hurt.'",
    "You're lucky I was still hurt from yesterday's battles.",
    "SENSOR READOUT: [enemy] is worthy to be assimilated.",
    "When I am repaired, [enemy], I will etch your name onto my hull.",
    "I might as well put on a dress and go back to the pen.",
    "Lean on the car and spread 'em, right?",
    "Do that again and I'll cut you, man!",
    "I didn't know I was within five feet of the fence.",
    "That gun don't mess around.",
    "Y'all put that thing down, [enemy]. Don't go messing with what you can't handle.",
    "Now I know what a piece of toast feels like.",
    "Y'all don't got the training to use that piece of heat.",
    "Oh, so you want to play rough?",
    "You piece of crap! Are you wearing a rabbit's foot?",
    "Consider yourself lucky, [enemy]. You just offed a bonafide war hero.",
    "Did I give you permission to touch me?",
    "Y'know, that really pisses me off.",
    "That won't happen again.",
    "Camping Scum!",
    "That was a mistake. You've made me, like, very angry now.",
    "Gross! Like, fragged by my own fave tool.",
    "Like, am I supposed to be impressed by that?",
    "Son of a ...? Am I, like, some kind of loser magnet?",
    "Totally uncool. Totally.",
    "This match might be, like, interesting after all.",
    "Consider yourself lucky. I only let the Adrianator do that.",
    "Nice moves! Like, are they yours or implants?"
];


/***********************************************************************/
/**************************** MISC FUNCTIONS ***************************/
/***********************************************************************/
function get_random_entry(array) {
    return array[Math.floor(Math.random()*array.length)];
};

// Converts RGB value to HSV value
function rgb2hsv(r, g, b) {
    var Hue = 0;
    var Sat = 0;
    var Val = 0;

    //  Convert to a percentage
    r = r / 255; g = g / 255; b = b / 255;
    var minRGB = Math.min(r, g, b);
    var maxRGB = Math.max(r, g, b);

    // Check for a grayscale image
    if (minRGB == maxRGB) {
        Val = parseInt((minRGB * 100) + .5); // Round up
        return [Hue, Sat, Val];
    }
    var d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
    var h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
    Hue = parseInt(60 * (h - d / (maxRGB - minRGB)));
    Sat = parseInt((((maxRGB - minRGB) / maxRGB) * 100) + .5);
    Val = parseInt((maxRGB * 100) + .5); // Round up
    return [Hue, Sat, Val];
};

// Converts HSV value to RGB value
function hsv2rgb(h, s, v) {
    // Set up rgb values to work with
    var r;
    var g;
    var b;

    // Sat and value are expressed as 0 - 100%
    // convert them to 0 to 1 for calculations
    s /= 100;
    v /= 100;

    if (s == 0) {
        v = Math.round(v * 255); // Convert to 0 to 255 and return
        return [v, v, v]; //  Grayscale, just send back value
    }

    h /= 60;   // Divide by 60 to get 6 sectors (0 to 5)

    var i = Math.floor(h);  // Round down to nearest integer
    var f = h - i;
    var p = v * (1 - s);
    var q = v * (1 - s * f);
    var t = v * (1 - s * (1 - f));

    // Each sector gets a different mix
    switch (i) {
      case 0:
        r = v; g = t; b = p;
        break;
      case 1:
        r = q; g = v; b = p;
        break;
      case 2:
        r = p; g = v; b = t;
        break;
      case 3:
        r = p; g = q; b = v;
        break;
      case 4:
        r = t; g = p; b = v;
        break;
      default:
        r = v; g = p; b = q;
        break;
    }
    //  Convert all decimial values back to 0 - 255
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Accept and add a Hue, Saturation, or Value for tinting.
function makeTint(img, h, s, v) {
    var canvas    = document.createElement('canvas');
    canvas.width  = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    //  Converts color to b&w, then adds tint
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (imgData != "") {
        for (y = 0; y < imgData.height; y++) {
            for (x = 0; x < imgData.width; x++) {
                var i = ((y * imgData.width) + x) * 4;  // our calculation
                //  Get average value to convert each pixel to black and white
                var aveColor = parseInt((imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3)
                //  Get the HSV value of the pixel
                var hsv = rgb2hsv(aveColor, aveColor, aveColor);
                //  Add incoming HSV values (tones)
                var tint = hsv2rgb(hsv[0] + h, hsv[1] + s, hsv[2] + v);
                // Put updated data back
                imgData.data[i] = tint[0];
                imgData.data[i + 1] = tint[1];
                imgData.data[i + 2] = tint[2];
            }
        }

        // Refresh the canvas with updated colors
        ctx.putImageData(imgData, 0, 0);

        var newimg = new Image();
        newimg.src = canvas.toDataURL();
        return newimg;
    }

    return null;
};
