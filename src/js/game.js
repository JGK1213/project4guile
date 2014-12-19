var game = new Phaser.Game(600, 600, Phaser.CANVAS, 'project4-game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('space', 'assets/images/space.jpg');
    game.load.image('bullet', 'assets/images/bullet.png');
    game.load.spritesheet('ship', 'assets/images/ship_sprite.png', 72, 72);
    game.load.image('obstacle', 'assets/images/obstacle.png');
    game.load.image('obstacle2', 'assets/images/obstacle2.png');
    game.load.image('bonus', 'assets/images/bonus.png');
    game.load.spritesheet('kaboom', 'assets/images/kaboom.png', 96, 96);
    game.load.audio('guile', ['assets/audio/UseThisGuile1.ogg', 'assets/audio/UseThisGuile1.mp3']);
    game.load.audio('hurt', ['assets/audio/flappyhit.ogg', 'assets/audio/flappyhit.mp3']);
    game.stage.disableVisibilityChange = true;
    game.load.image('start', 'assets/images/start.png', 270, 180);
    game.load.image('reset', 'assets/images/playagain.png', 270, 180);

}

var space;
var player;
var obstacles;
var bonuses;
var cursors;
var music;

var explosions;
var score = 0;
var highscore = 0;
var scoreString = '';
var highscoreString = '';
var scoreText;
var highscoreText;
var level = 1;
var levelString = '';
var levelText;

var bullet;
var bullets;
var bulletTime = 0;
var particles;
var textureRegistry = {};
var gameOver = false;
var i = 0;
var speed = 600;  // initial speed
var time = 200;   // initial time in milleseconds to spawn obstacles
var gameStarted = false;
var resetCounter = 0;
var bonusCounter = 0;


function create() {
    // Display the background
    space = game.add.tileSprite(0, 0, game.width, game.height, 'space');
    game.physics.enable(space, Phaser.Physics.ARCADE);
    space.autoScroll(0, 300);
    

    //  This will run in Canvas mode, so let's gain a little speed and display
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;

    // Add music! 
    music = game.add.audio('guile');
    music.loop= true;
    music.play();

    // Add a punch sound!
    hurtSnd = game.add.audio('hurt');


    //  We need arcade physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A spacey background
    // game.add.tileSprite(0, 0, game.width, game.height, 'space');

    //  Our ships bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.setAll('outOfBoundsKill', true);

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', -0.3);
    bullets.setAll('anchor.y', 0.2);

    //  Our player ship
    player = game.add.sprite(300, 560, 'ship');
    player.anchor.set(0.5);
    player.animations.add('ship');
    player.animations.play('ship', 24, true);

    // Obstacles
    obstacles = game.add.group();
    obstacles.enableBody = true;
    obstacles.physicsBodyType = Phaser.Physics.ARCADE;

    if(resetCounter >= 1) {
      createObstacles();
    }


    // Bonus Obstacle
    bonuses = game.add.group();
    bonuses.enableBody = true;
    bonuses.physicsBodyType = Phaser.Physics.ARCADE;

    if(resetCounter >= 1) {
      createBonus();
    }
    

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 5, scoreString + score, { font: '20px Arial', fill: '#fff' });

    //  The High Score
    highscoreString = 'High Score: ';
    highscoreText = game.add.text( 415, 5, highscoreString + localStorage.getItem("highscore"), {font: '20px Arial', fill: '#fff'});

    //   The Level
    levelString = 'Level : ';
    levelText = game.add.text(10, 30, levelString + level, { font: '20px Arial', fill: '#fff' });


    //  and its physics settings
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.drag.set(100);
    player.body.maxVelocity.set(500);

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(5, 'kaboom');
    explosions.forEach(setupObstacle, this);
    explosions.forEach(setupPlayer, this);


    //  Game input
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
    if(!gameStarted) {
      game.paused = true;
      menu = game.add.sprite(300, 300, 'start');
      menu.anchor.setTo(0.5, 0.5);
    }
    game.input.onTap.addOnce(unpause, self);
    function unpause(event){
      if(game.paused){
        if (!gameOver) {
          game.paused = false;
          menu.destroy();
          createObstacles();
          createBonus();
        }
      }
    };

  
}

//Creates the Obstacles
function createObstacles () {
    function difficulty() {
      setTimeout(function () {
        if(level%2==0){
          var obstacle = obstacles.create((Math.floor(Math.random() * 600) + 1),-100, 'obstacle2');
        }
        else {
          var obstacle = obstacles.create((Math.floor(Math.random() * 600) + 1),-100, 'obstacle');
        };
        obstacle.anchor.setTo(0.5, 0.5);
        obstacle.body.velocity.y= speed;
        i++;
        if(!game.paused){
        if( i % 50 == 0) {
          if (speed < 6000){
            speed += 100;      //increase speed of obstacles every 40 obstacles.
            level += 1;
            levelText.text = levelString + level;
          };
          if (time > 10) {  //decreases spawn time between obstacles.
            time -= 10;
          };
            if (!gameOver) {
              difficulty();
            }
        }
        else {
            if(!gameOver) {
              difficulty();
            }
        }
        }
      }, time)
    }
    if(!gameOver) {
      difficulty();
    }
}

function createBonus() {
  function repeat(){
    if(level%2==0){
      console.log("created bonus")
      var bonus = bonuses.create((Math.floor(Math.random() * 500) + 50), -200,'bonus');
      bonus.anchor.setTo(0.5, 0.5);
      bonus.body.velocity.y= 350;
      bonusCounter++;
    }
  }
  if(level%2!=0) {
    bonusCounter = 0;
  }
  if(!gameOver){
    if(bonusCounter == 0) {
      repeat();
    }
  }
}


function setupObstacle (obstacle) {
    obstacle.anchor.x = 0.4;
    obstacle.anchor.y = 0.3;
    obstacle.animations.add('kaboom');
}
function setupBonus (bonus) {
    bonus.anchor.x = 0.4;
    bonus.anchor.y = 0.3;
    bonus.animations.add('bonus');
}
function setupPlayer (player) {
    player.anchor.x = 0.4;
    player.anchor.y = 0.3;
    player.animations.add('kaboom');

}

function update() {
  if (player.alive) {
    player.body.velocity.setTo(0, 0);

    if (cursors.left.isDown) {
      player.body.velocity.x = -1200;
    }
    else if (cursors.right.isDown) {
      player.body.velocity.x = 1200;
    }
      player.body.collideWorldBounds = true;

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        fireBullet();
    }
  }

  if(!gameOver){
    createBonus();
  }

    
  game.physics.arcade.collide(player);

  //  Run collision
  game.physics.arcade.overlap(bullets, obstacles, bulletHitsObstacle, null, this);
  game.physics.arcade.overlap(bullets, bonuses, bulletHitsBonus, null, this);
  game.physics.arcade.overlap(obstacles, player, obstacleHitsPlayer, null, this);
  game.physics.arcade.overlap(bonuses, player, bonusHitsPlayer, null, this);
  // game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
}

function fireBullet () {
  var coolDown = 100;  // Bullet Cool Down between shots
    if (game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(player.body.x + 16, player.body.y + 16);
            bullet.lifespan = 1050;
            // bullet.rotation = player.rotation;
            bullet.body.velocity.y = -500;
            // game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
            if (coolDown >= 40) {
              if (level % 3 ==0) {
                coolDown -= 20;
              }
            }
            bulletTime = game.time.now + coolDown;
        }
    }
}

function bulletHitsObstacle (bullet, obstacle) {

    //  When a bullet hits an obstacle we kill them both
    bullet.kill();
    obstacle.kill();

    //  Increase the score
    if(!gameOver) {
      score += 10;
      scoreText.text = scoreString + score;
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(obstacle.body.x, obstacle.body.y);
    explosion.play('kaboom', 50, false, true);

}
function bulletHitsBonus (bullet, bonus) {

    //  When a bullet hits an bonus we kill them both
    bullet.kill();
    bonus.kill();

    //  Increase the score
    if(!gameOver){
      score += 500;
      scoreText.text = scoreString + score;
    }
    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(bonus.body.x, bonus.body.y);
    explosion.play('kaboom', 50, false, true);

}

function obstacleHitsPlayer (player, obstacle) {
    player.kill();
    obstacle.kill();
    hurtSnd.play();
    // setTimeout(function(){dieSnd.play();},600)
    

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 50, false, true);
    setGameOver();
    if (score > localStorage.getItem("highscore")) {
                localStorage.setItem("highscore", score);
    }
    if (gameOver==true) {
      restartGame= game.add.sprite(300, 300, 'reset');
      restartGame.anchor.setTo(0.5, 0.5);
      game.input.onTap.addOnce(reset,this);
    }

}
function bonusHitsPlayer (player, bonus) {
    player.kill();
    bonus.kill();
    hurtSnd.play();
    
    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 50, false, true);
    setGameOver();
    if (score > localStorage.getItem("highscore")) {
                localStorage.setItem("highscore", score);
    }
    if (gameOver==true) {
      restartGame = game.add.sprite(300, 300, 'reset');
      restartGame.anchor.setTo(0.5, 0.5);
      game.input.onTap.addOnce(reset,this);
    }

}

function resetBullet (bullet) {
    //  Called if the bullet goes out of the screen
    bullet.kill();
}

function setGameOver() {
  // gameStarted = false;
  gameOver = true;
  music.stop();
}

function reset() {
    restartGame.destroy();
    gameStarted = true;
    gameOver = false;
    score = 0;
    level = 1,
    bulletTime = 0;
    i = 0;
    speed = 600;  // initial speed
    time = 250; 
    resetCounter++;
    obstacles.removeAll();
    bonuses.removeAll();
    game.state.restart();
}

function render(){

}