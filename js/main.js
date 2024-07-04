document.addEventListener('DOMContentLoaded', function () {
  let text = document.getElementById('text');
  let leaf = document.getElementById('leaf');
  let hill1 = document.getElementById('hill1');
  let hill2 = document.getElementById('hill2');
  let hill3 = document.getElementById('hill3');
  let hill4 = document.getElementById('hill4');
  let hill5 = document.getElementById('hill5');

  window.addEventListener('scroll', () => {
      let value = window.scrollY;

      text.style.marginTop = value * 2.5 + 'px';
      leaf.style.top = value * -1.5 + 'px';
      leaf.style.left = value * 1.5 + 'px';
      hill1.style.top = value * 1 + 'px';
      hill2.style.top = value * 0.8 + 'px';
      hill3.style.top = value * 0.6 + 'px';
      hill4.style.top = value * 0.4 + 'px';
      hill5.style.top = value * 0.2 + 'px';
  });

  document.getElementById('gameContainer').style.display = 'none';
  document.getElementById('gameOverScreen').classList.add('hidden');
  document.getElementById('levelsMenu').classList.add('hidden');

  document.getElementById('startButton').addEventListener('click', function () {
      document.getElementById('landingPage').style.display = 'none';
      document.getElementById('gameContainer').style.display = 'block';
      // Start the Phaser game with level 1
      game.scene.start('Game', { level: 'level1' });
      document.getElementById('gameContainer').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('levelsButton').addEventListener('click', function () {
      document.getElementById('levelsMenu').classList.toggle('hidden');
  });

  document.getElementById('closeLevelsButton').addEventListener('click', function () {
      document.getElementById('levelsMenu').classList.add('hidden');
  });

  document.querySelectorAll('.levelButton').forEach(button => {
    button.addEventListener('click', function () {
        let level = this.getAttribute('data-level');
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'block';
        game.scene.start('Game', { level: level });
        document.getElementById('gameContainer').scrollIntoView({ behavior: 'smooth' });

        // Hide the levels menu after selecting a level
        document.getElementById('levelsMenu').classList.add('hidden');
    });
});
});
document.addEventListener('DOMContentLoaded', function () {

document.getElementById('gameContainer').style.display = 'none';
document.getElementById('gameOverScreen').classList.add('hidden');
});

document.getElementById('startButton').addEventListener('click', function () {
document.getElementById('landingPage').style.display = 'none';
document.getElementById('gameContainer').style.display = 'block';

// Start the Phaser game with level 1
game.scene.start('Game', { level: 'level1' });
});

let gameScene = new Phaser.Scene('Game');

// Parameters for our scene
gameScene.init = function (data) {
this.playerSpeed = 150;
this.jumpSpeed = -600;
this.reachedGoalRed = false;
this.reachedGoalBlue = false;
this.currentLevel = data.level || 'level1';
console.log('Initializing level:', this.currentLevel);
};

gameScene.preload = function () {
this.load.image('background_level1', 'assets/images/background_level1.png');
this.load.image('background_level2', 'assets/images/background_level2.png');
this.load.image('background_level3', 'assets/images/background_level3.png');
this.load.image('background_level4', 'assets/images/background_level4.png');
this.load.image('background_level5', 'assets/images/background_level5.png');

this.load.image('ground', 'assets/images/ground.png');
this.load.image('platform', 'assets/images/platform.png');
this.load.image('platform_vertical', 'assets/images/platform_vertical.png');
this.load.image('block', 'assets/images/block.png');
this.load.image('goal_red', 'assets/images/door_red.png');
this.load.image('goal_blue', 'assets/images/door_blue.png');
this.load.image('barrel', 'assets/images/barrel.png');

this.load.spritesheet('player_red', 'assets/images/player_red_spritesheet.png', {
  frameWidth: 28,
  frameHeight: 30,
  margin: 1,
  spacing: 1
});

this.load.spritesheet('player_blue', 'assets/images/player_blue_spritesheet.png', {
  frameWidth: 28,
  frameHeight: 30,
  margin: 1,
  spacing: 1
});

this.load.spritesheet('fire_red', 'assets/images/fire_red_spritesheet.png', {
  frameWidth: 20,
  frameHeight: 21,
  margin: 1,
  spacing: 1
});

this.load.spritesheet('fire_blue', 'assets/images/fire_blue_spritesheet.png', {
  frameWidth: 20,
  frameHeight: 21,
  margin: 1,
  spacing: 1
});

this.load.json('level1', 'assets/json/level1.json');
this.load.json('level2', 'assets/json/level2.json');
this.load.json('level3', 'assets/json/level3.json');
this.load.json('level4', 'assets/json/level4.json');
this.load.json('level5', 'assets/json/level5.json');
};

gameScene.create = function () {
this.levelData = this.cache.json.get(this.currentLevel);

this.add.image(0, 0, this.levelData.world.background).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

this.setupAnimations();
this.setupLevel(this.currentLevel);
this.setupCollisions();

this.cursors = this.input.keyboard.createCursorKeys();
this.wasd = this.input.keyboard.addKeys({
  up: Phaser.Input.Keyboard.KeyCodes.W,
  down: Phaser.Input.Keyboard.KeyCodes.S,
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D
});

this.input.on('pointerdown', function (pointer) {
  console.log(pointer.x, pointer.y);
});

document.getElementById('retryButton').removeEventListener('click', this.retryListener);
document.getElementById('gameOverExitButton').removeEventListener('click', this.exitListener);

this.retryListener = () => {
  this.scene.restart({ level: this.currentLevel });
  document.getElementById('gameOverScreen').classList.add('hidden');
};

this.exitListener = () => {
  // Implement exit functionality, e.g., navigate to another page or close the game
};

document.getElementById('retryButton').addEventListener('click', this.retryListener);
document.getElementById('gameOverExitButton').addEventListener('click', this.exitListener);
};

gameScene.update = function () {
if (this.gameOverScreenVisible) {
  return;
}

let onGroundRed = this.player_red.body.blocked.down || this.player_red.body.touching.down;

if (this.cursors.left.isDown) {
  this.player_red.body.setVelocityX(-this.playerSpeed);
  this.player_red.flipX = false;
  if (onGroundRed && !this.player_red.anims.isPlaying) {
    this.player_red.anims.play('walking_red');
  }
} else if (this.cursors.right.isDown) {
  this.player_red.body.setVelocityX(this.playerSpeed);
  this.player_red.flipX = true;
  if (onGroundRed && !this.player_red.anims.isPlaying) {
    this.player_red.anims.play('walking_red');
  }
} else {
  this.player_red.body.setVelocityX(0);
  this.player_red.anims.stop('walking_red');
  if (onGroundRed) {
    this.player_red.setFrame(3);
  }
}

if (onGroundRed && this.cursors.up.isDown) {
  this.player_red.body.setVelocityY(this.jumpSpeed);
  this.player_red.anims.stop('walking_red');
  this.player_red.setFrame(2);
}

let onGroundBlue = this.player_blue.body.blocked.down || this.player_blue.body.touching.down;

if (this.wasd.left.isDown) {
  this.player_blue.body.setVelocityX(-this.playerSpeed);
  this.player_blue.flipX = false;
  if (onGroundBlue && !this.player_blue.anims.isPlaying) {
    this.player_blue.anims.play('walking_blue');
  }
} else if (this.wasd.right.isDown) {
  this.player_blue.body.setVelocityX(this.playerSpeed);
  this.player_blue.flipX = true;
  if (onGroundBlue && !this.player_blue.anims.isPlaying) {
    this.player_blue.anims.play('walking_blue');
  }
} else {
  this.player_blue.body.setVelocityX(0);
  this.player_blue.anims.stop('walking_blue');
  if (onGroundBlue) {
    this.player_blue.setFrame(3);
  }
}

if (onGroundBlue && this.wasd.up.isDown) {
  this.player_blue.body.setVelocityY(this.jumpSpeed);
  this.player_blue.anims.stop('walking_blue');
  this.player_blue.setFrame(2);
}
};

gameScene.setupAnimations = function () {
if (!this.anims.get('walking_red')) {
  this.anims.create({
    key: 'walking_red',
    frames: this.anims.generateFrameNames('player_red', { frames: [0, 1, 2] }),
    frameRate: 12,
    yoyo: true,
    repeat: -1
  });
}

if (!this.anims.get('walking_blue')) {
  this.anims.create({
    key: 'walking_blue',
    frames: this.anims.generateFrameNames('player_blue', { frames: [0, 1, 2] }),
    frameRate: 12,
    yoyo: true,
    repeat: -1
  });
}

if (!this.anims.get('burning_red')) {
  this.anims.create({
    key: 'burning_red',
    frames: this.anims.generateFrameNames('fire_red', { frames: [0, 1] }),
    frameRate: 4,
    repeat: -1
  });
}

if (!this.anims.get('burning_blue')) {
  this.anims.create({
    key: 'burning_blue',
    frames: this.anims.generateFrameNames('fire_blue', { frames: [0, 1] }),
    frameRate: 4,
    repeat: -1
  });
}
};

// Sets up level elements using data from the specified level JSON
gameScene.setupLevel = function (levelKey) {
console.log('Setting up level:', levelKey);

// Load JSON data
this.levelData = this.cache.json.get(levelKey);

// Set background image using the background property from the level data
this.add.image(0, 0, this.levelData.background).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);

// Platforms setup
this.platforms = this.physics.add.staticGroup();
this.levelData.platforms.forEach(platform => {
  if (platform.numTiles === 1) {
    // Single sprite platform
    let obj = this.add.sprite(platform.x, platform.y, platform.key).setOrigin(0);
    this.physics.add.existing(obj, true);
    this.platforms.add(obj);
  } else {
    // Tile sprite platform
    let width = this.textures.get(platform.key).get(0).width;
    let height = this.textures.get(platform.key).get(0).height;
    let obj = this.add.tileSprite(platform.x, platform.y, platform.numTiles * width, height, platform.key).setOrigin(0);
    this.physics.add.existing(obj, true);
    this.platforms.add(obj);
  }
});

// Red fires setup
this.fires_red = this.physics.add.group();
if (this.levelData.fires_red) {
  this.levelData.fires_red.forEach(fire => {
    let obj = this.add.sprite(fire.x, fire.y, 'fire_red').setOrigin(0);
    obj.anims.play('burning_red');
    this.fires_red.add(obj);
  });
}

// Blue fires setup
this.fires_blue = this.physics.add.group();
if (this.levelData.fires_blue) {
  this.levelData.fires_blue.forEach(fire => {
    let obj = this.add.sprite(fire.x, fire.y, 'fire_blue').setOrigin(0);
    obj.anims.play('burning_blue');
    this.fires_blue.add(obj);
  });
}

// Red goal setup
if (this.levelData.goal_red) {
  this.goal_red = this.add.sprite(this.levelData.goal_red.x, this.levelData.goal_red.y, 'goal_red');
  this.physics.add.existing(this.goal_red);
}

// Blue goal setup
if (this.levelData.goal_blue) {
  this.goal_blue = this.add.sprite(this.levelData.goal_blue.x, this.levelData.goal_blue.y, 'goal_blue');
  this.physics.add.existing(this.goal_blue);
}

// Player_red setup
this.player_red = this.add.sprite(this.levelData.player_red.x, this.levelData.player_red.y, 'player_red', 3);
this.physics.add.existing(this.player_red);
this.player_red.body.setCollideWorldBounds(true);

// Player_blue setup
this.player_blue = this.add.sprite(this.levelData.player_blue.x, this.levelData.player_blue.y, 'player_blue', 3);
this.physics.add.existing(this.player_blue);
this.player_blue.body.setCollideWorldBounds(true);
};

// Sets up collision and overlap checks
gameScene.setupCollisions = function () {
// Collisions
this.physics.add.collider([this.player_red, this.player_blue, this.goal_blue, this.goal_red], this.platforms);
this.physics.add.collider([this.fires_blue, this.fires_red], this.platforms);

// Overlaps
this.physics.add.overlap(this.player_red, this.fires_blue, this.gameOver, null, this);
this.physics.add.overlap(this.player_blue, this.fires_red, this.gameOver, null, this);
this.physics.add.overlap(this.player_red, this.goal_red, this.handleOverlapRed, null, this);
this.physics.add.overlap(this.player_blue, this.goal_blue, this.handleOverlapBlue, null, this);
};

// Handles overlap for player_red
gameScene.handleOverlapRed = function (player, target) {
if (target.texture.key === 'fire_blue') {
  this.gameOver();
} else if (target.texture.key === 'goal_red') {
  this.reachedGoalRed = true;
  player.body.enable = false; // Disable player physics
  player.setVisible(false); // Hide player
  console.log('Player Red reached goal');
  this.checkGameEnd();
}
};

// Handles overlap for player_blue
gameScene.handleOverlapBlue = function (player, target) {
if (target.texture.key === 'fire_red') {
  this.gameOver();
} else if (target.texture.key === 'goal_blue') {
  this.reachedGoalBlue = true;
  player.body.enable = false; // Disable player physics
  player.setVisible(false); // Hide player
  console.log('Player Blue reached goal');
  this.checkGameEnd();
}
};

gameScene.checkGameEnd = function () {
if (this.reachedGoalRed && this.reachedGoalBlue) {
  console.log('Both players reached goals. Switching to new level.');

  // Determine next level
  if (this.currentLevel === 'level1') {
    this.currentLevel = 'level2';
  } else if (this.currentLevel === 'level2') {
    this.currentLevel = 'level3';
  } else if (this.currentLevel === 'level3') {
    this.currentLevel = 'level4';
  } // Add more levels as needed

  // Restart scene with the new level
  this.scene.restart({ level: this.currentLevel });
}
};


// Show game over screen
// Show game over screen
gameScene.gameOver = function () {
// Pause the game scene
this.physics.pause(); // Pause physics simulation
this.input.keyboard.enabled = false; // Disable keyboard input

// Stop player animations
this.player_red.anims.stop();
this.player_blue.anims.stop();

// Show game over screen UI
document.getElementById('gameOverScreen').classList.remove('hidden');
this.input.keyboard.enabled = true; // Disable keyboard input

};

// Restart game
gameScene.restartGame = function () {
console.log('Restarting game at level:', this.currentLevel);
this.scene.restart({ level: this.currentLevel });
document.getElementById('gameOverScreen').classList.add('hidden');
this.gameOverScreenVisible = false; // Reset flag to allow input
};


gameScene.playerHit = function (player, fire) {
console.log('Game Over');
this.scene.pause();
this.gameOverScreenVisible = true;
document.getElementById('gameOverScreen').classList.remove('hidden');
};

gameScene.playerGoal = function (player, goal) {
if (player.texture.key === 'player_red' && goal.texture.key === 'goal_red') {
  this.reachedGoalRed = true;
} else if (player.texture.key === 'player_blue' && goal.texture.key === 'goal_blue') {
  this.reachedGoalBlue = true;
}

if (this.reachedGoalRed && this.reachedGoalBlue) {
  console.log('Level Complete');
  let nextLevel = this.levelData.nextLevel;
  if (nextLevel) {
    this.scene.restart({ level: nextLevel });
  } else {
    console.log('You have completed all levels!');
  }
}
};


let config = {
type: Phaser.AUTO,
width: 1000,
height: 750,
physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: 1000 },
    debug: false
  }
},
scene: gameScene,
parent: 'gameContainer',
title: 'Red Flame Blue Flame',
pixelArt: false,
backgroundColor: '000000'
};

let game = new Phaser.Game(config);