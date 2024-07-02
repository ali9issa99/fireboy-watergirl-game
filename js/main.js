// Create a new scene
let gameScene = new Phaser.Scene('Game');

// Parameters for our scene
gameScene.init = function() {
  // Player parameters
  this.playerSpeed = 150;
  this.jumpSpeed = -600;
};

// Load asset files for our game
gameScene.preload = function() {
  // Load images
  this.load.image('background', 'assets/images/l1_background.png');
  this.load.image('ground', 'assets/images/ground.png');
  this.load.image('platform', 'assets/images/platform.png');
  this.load.image('platform_vertical', 'assets/images/platform_vertical.png');
  this.load.image('block', 'assets/images/block.png');
  this.load.image('goal_red', 'assets/images/door_red.png');
  this.load.image('goal_blue', 'assets/images/door_blue.png');
  this.load.image('barrel', 'assets/images/barrel.png');

  // Load spritesheets
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

  // Load level data JSON
  this.load.json('levelData', 'assets/json/levelData.json');
};

// Executed once, after assets were loaded
gameScene.create = function() {
  // Background image
  this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  // Setup animations
  this.setupAnimations();

  // Setup level elements
  this.setupLevel();

  // Collision detection
  this.setupCollisions();

  // Cursor keys for player_red
  this.cursors = this.input.keyboard.createCursorKeys();

  // Cursor keys for player_blue
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // Input event listener
  this.input.on('pointerdown', function(pointer) {
    console.log(pointer.x, pointer.y);
  });
};

// Executed on every frame
gameScene.update = function() {
  // Check if player_red is on the ground
  let onGroundRed = this.player_red.body.blocked.down || this.player_red.body.touching.down;

  // Movement for player_red
  if (this.cursors.left.isDown) {
    this.player_red.body.setVelocityX(-this.playerSpeed);
    this.player_red.flipX = false;
    if (onGroundRed && !this.player_red.anims.isPlaying)
      this.player_red.anims.play('walking_red');
  } else if (this.cursors.right.isDown) {
    this.player_red.body.setVelocityX(this.playerSpeed);
    this.player_red.flipX = true;
    if (onGroundRed && !this.player_red.anims.isPlaying)
      this.player_red.anims.play('walking_red');
  } else {
    this.player_red.body.setVelocityX(0);
    this.player_red.anims.stop('walking_red');
    if (onGroundRed)
      this.player_red.setFrame(3);
  }

  // Jumping for player_red
  if (onGroundRed && this.cursors.up.isDown) {
    this.player_red.body.setVelocityY(this.jumpSpeed);
    this.player_red.anims.stop('walking_red');
    this.player_red.setFrame(2);
  }

  // Check if player_blue is on the ground
  let onGroundBlue = this.player_blue.body.blocked.down || this.player_blue.body.touching.down;

  // Movement for player_blue
  if (this.wasd.left.isDown) {
    this.player_blue.body.setVelocityX(-this.playerSpeed);
    this.player_blue.flipX = false;
    if (onGroundBlue && !this.player_blue.anims.isPlaying)
      this.player_blue.anims.play('walking_blue');
  } else if (this.wasd.right.isDown) {
    this.player_blue.body.setVelocityX(this.playerSpeed);
    this.player_blue.flipX = true;
    if (onGroundBlue && !this.player_blue.anims.isPlaying)
      this.player_blue.anims.play('walking_blue');
  } else {
    this.player_blue.body.setVelocityX(0);
    this.player_blue.anims.stop('walking_blue');
    if (onGroundBlue)
      this.player_blue.setFrame(3);
  }

  // Jumping for player_blue
  if (onGroundBlue && this.wasd.up.isDown) {
    this.player_blue.body.setVelocityY(this.jumpSpeed);
    this.player_blue.anims.stop('walking_blue');
    this.player_blue.setFrame(2);
  }
};

// Sets up animations for players and fire
gameScene.setupAnimations = function() {
  // Animation for player_red
  if (!this.anims.get('walking_red')) {
    this.anims.create({
      key: 'walking_red',
      frames: this.anims.generateFrameNames('player_red', { frames: [0, 1, 2] }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });
  }

  // Animation for player_blue
  if (!this.anims.get('walking_blue')) {
    this.anims.create({
      key: 'walking_blue',
      frames: this.anims.generateFrameNames('player_blue', { frames: [0, 1, 2] }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });
  }

  // Animation for fire_red
  if (!this.anims.get('burning_red')) {
    this.anims.create({
      key: 'burning_red',
      frames: this.anims.generateFrameNames('fire_red', { frames: [0, 1] }),
      frameRate: 4,
      repeat: -1
    });
  }

  // Animation for fire_blue
  if (!this.anims.get('burning_blue')) {
    this.anims.create({
      key: 'burning_blue',
      frames: this.anims.generateFrameNames('fire_blue', { frames: [0, 1] }),
      frameRate: 4,
      repeat: -1
    });
  }
};

// Sets up level elements using data from levelData.json
gameScene.setupLevel = function() {
  // Load JSON data
  this.levelData = this.cache.json.get('levelData');

  // Background and camera setup
  this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
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
gameScene.setupCollisions = function() {
  // Collisions
  this.physics.add.collider([this.player_red, this.player_blue, this.goal_red, this.goal_blue], this.platforms);
  this.physics.add.collider([this.fires_blue, this.fires_red], this.platforms)

  // Overlaps
  this.physics.add.overlap(this.player_red, [this.fires_blue, this.goal_red], this.restartGame, null, this);
  this.physics.add.overlap(this.player_blue, [this.fires_red, this.goal_blue], this.restartGame, null, this);
};

// Restarts the game
gameScene.restartGame = function() {
  // Fade out
  this.cameras.main.fade(500);

  // On fade out complete, restart scene
  this.cameras.main.on('camerafadeoutcomplete', function() {
    this.scene.restart();
  }, this);
};

// Game configuration
let config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 750,
  scene: gameScene,
  title: 'Monster Kong',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  }
};

// Create the game
let game = new Phaser.Game(config);
