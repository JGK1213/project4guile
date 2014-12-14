
var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'project4-game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('space', 'http://fc03.deviantart.net/fs71/f/2013/269/0/7/peach_tea_animated_cb_6colo_by_missdudette-d6o2o85.gif');
    game.load.image('bullet', 'http://img2.wikia.nocookie.net/__cb20121009064131/pockiepirate/images/9/99/Basic_Energy_Ball.png');
    game.load.image('ship', 'http://www.pixeljoint.com/files/icons/ship2_transparent_shading2.png');
    game.load.image('invader', 'http://www.heruraha.net/download/file.php?avatar=22688_1343737809.png');
    game.load.spritesheet('kaboom', 'http://fc02.deviantart.net/fs71/f/2013/010/9/f/explosion_spritesheet_for_games_by_gintasdx-d5r28q5.png', 128, 128);
     game.load.audio('guile', ['assets/audio/guilestheme.mp3']);

}

  


var space;
var player;
var obstacles;
var cursors;
var music;

var explosions;
var score = 0;
var scoreString = '';
var scoreText;

var bullet;
var bullets;
var bulletTime = 0;
var particles;
var textureRegistry = {};


function create() {

    // Display the background
    space = game.add.tileSprite(0, 0, 800, 800, 'space');
    game.physics.enable(space, Phaser.Physics.ARCADE);
    space.autoScroll(0, 400);
    

    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    // Add music! 
    music = game.add.audio('guile');

    music.play();

    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background
    // game.add.tileSprite(0, 0, game.width, game.height, 'space');

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', -0.3);
    bullets.setAll('anchor.y', 0.2);

    //  Our player ship
    player = game.add.sprite(400, 750, 'ship');
    player.anchor.set(0.5);

    // Obstacles
    obstacles = game.add.group();
    obstacles.enableBody = true;
    obstacles.physicsBodyType = Phaser.Physics.ARCADE;

    createObstacles();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    // player.body.set('body.collideWorldBounds', true);

    //  and its physics settings
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.drag.set(100);
    player.body.maxVelocity.set(500);

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(50, 'kaboom');
    explosions.forEach(setupInvader, this);


    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);



    }

function createObstacles () {

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var obstacle = obstacles.create(x * 48, y * 50, 'invader');
            obstacle.anchor.setTo(0.5, 0.5);
            obstacle.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            obstacle.play('fly');
            obstacle.body.moves = false;
        }
    }

    obstacles.x = 100;
    obstacles.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(obstacles).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
}

function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    obstacles.y += 10;

}

function update() {
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -400;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 400;
        }
        player.body.collideWorldBounds = true;

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        fireBullet();
    }

    // screenWrap(player);

    bullets.forEachExists(screenWrap, this);
    // game.physics.arcade.collide(player, particles);
    // game.physics.arcade.collide(particles);
    game.physics.arcade.collide(player);

    //  Run collision
    game.physics.arcade.overlap(bullets, obstacles, collisionHandler, null, this);
    // game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);

}

function collisionHandler (bullet, obstacle) {

    //  When a bullet hits an obstacle we kill them both
    bullet.kill();
    obstacle.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(obstacle.body.x, obstacle.body.y);
    explosion.play('kaboom', 50, false, true);

    if (obstacles.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        // enemyBullets.callAll('kill',this);
        // stateText.text = " You Won, \n Click to restart";
        // stateText.visible = true;

        //the "click to restart" handler
        // game.input.onTap.addOnce(restart,this);
    }

}

function fireBullet () {

    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(player.body.x + 16, player.body.y + 16);
            bullet.lifespan = 1400;
            // bullet.rotation = player.rotation;
            bullet.body.velocity.y = -500;
            // game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
            bulletTime = game.time.now + 150;
        }
    }

}
function createBlock(size, color) {
  var name = size + '_' + color;
  if(textureRegistry[name]) {
    return textureRegistry[name];
  }
  
  var bmd = game.add.bitmapData(size, size);
  bmd.ctx.fillStyle = color;
  bmd.ctx.fillRect(0,0, size, size);
  textureRegistry[name] = bmd;
  return bmd;
}

function screenWrap (player) {

    if (player.x < 0)
    {
        player.x = game.width;
    }
    else if (player.x > game.width)
    {
        player.x = 0;
    }

    if (player.y < 0)
    {
        player.y = game.height;
    }
    else if (player.y > game.height)
    {
        player.y = 0;
    }

}

function render() {
}
