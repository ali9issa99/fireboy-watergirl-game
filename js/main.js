// create a new scene
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene
gameScene.init = function() {
  // player parameters
  this.playerSpeed = 150;
  this.jumpSpeed = -600;
};

// load asset files for our game
gameScene.preload = function() {
  // load images
  this.load.image('background', 'assets/images/l1_background.png');
  this.load.image('ground', 'assets/images/ground.png');
  this.load.image('platform', 'assets/images/platform.png');
  this.load.image('platform_vertical', 'assets/images/platform_vertical.png');
  this.load.image('block', 'assets/images/block.png');
  this.load.image('goal_blue', 'assets/images/door_blue.png');
  this.load.image('goal_red', 'assets/images/door_red.png'); // Load door_red
  this.load.image('barrel', 'assets/images/barrel.png');
  
  // load spritesheets
  this.load.spritesheet('player', 'assets/images/player_spritesheet.png', {
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
  
  this.load.json('levelData', 'assets/json/levelData.json');
};

// executed once, after assets were loaded
gameScene.create = function() {
  this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  if (!this.anims.get('walking')) {
    // walking animation
    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNames('player', {
        frames: [0, 1, 2]
      }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });
  }

  if (!this.anims.get('burning_red')) {
    // fire red animation
    this.anims.create({
      key: 'burning_red',
      frames: this.anims.generateFrameNames('fire_red', {
        frames: [0, 1]
      }),
      frameRate: 4,
      repeat: -1
    });
  }

  if (!this.anims.get('burning_blue')) {
    // fire blue animation
    this.anims.create({
      key: 'burning_blue',
      frames: this.anims.generateFrameNames('fire_blue', {
        frames: [0, 1]
      }),
      frameRate: 4,
      repeat: -1
    });
  }

  // add all level elements
  this.setupLevel();

  // initiate barrel spawner
  // this.setupSpawner();

  // collision detection
  this.physics.add.collider([this.player, this.goal_red, this.goal_blue, this.barrels], this.platforms);

  // overlap checks
  this.physics.add.overlap(this.player, [this.fires_red, this.fires_blue, this.goal_red, this.goal_blue, this.barrels], this.restartGame, null, this);

  // enable cursor keys
  this.cursors = this.input.keyboard.createCursorKeys();

  this.input.on('pointerdown', function(pointer) {
    console.log(pointer.x, pointer.y);
  });
};

// executed on every frame
gameScene.update = function() {
  // are we on the ground?
  let onGround = this.player.body.blocked.down || this.player.body.touching.down;

  // movement to the left
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-this.playerSpeed);

    this.player.flipX = false;

    // play animation if none is playing
    if (onGround && !this.player.anims.isPlaying)
      this.player.anims.play('walking');
  }

  // movement to the right
  else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(this.playerSpeed);

    this.player.flipX = true;

    // play animation if none is playing
    if (onGround && !this.player.anims.isPlaying)
      this.player.anims.play('walking');
  } else {
    // make the player stop
    this.player.body.setVelocityX(0);

    // stop walking animation
    this.player.anims.stop('walking');

    // set default frame
    if (onGround)
      this.player.setFrame(3);
  }

  // handle jumping
  if (onGround && (this.cursors.space.isDown || this.cursors.up.isDown)) {
    // give the player a velocity in Y
    this.player.body.setVelocityY(this.jumpSpeed);

    // stop the walking animation
    this.player.anims.stop('walking');

    // change frame
    this.player.setFrame(2);
  }
};

// sets up all the elements in the level
gameScene.setupLevel = function() {
  // load json data
  this.levelData = this.cache.json.get('levelData');

  // world bounds
  this.physics.world.bounds.width = this.levelData.world.width;
  this.physics.world.bounds.height = this.levelData.world.height;

  // create all the platforms
  this.platforms = this.physics.add.staticGroup();
  for (let i = 0; i < this.levelData.platforms.length; i++) {
    let curr = this.levelData.platforms[i];

    let newObj;

    // create object
    if(curr.numTiles == 1) {
      // create sprite
      newObj = this.add.sprite(curr.x, curr.y, curr.key).setOrigin(0);
    }
    else {
      // create tilesprite
      let width = this.textures.get(curr.key).getSourceImage().width;
      let height = this.textures.get(curr.key).getSourceImage().height;
      newObj = this.add.tileSprite(curr.x, curr.y, curr.numTiles * width , height ,curr.key).setOrigin(0);
    }

    // enable physics
    this.physics.add.existing(newObj, true);

    // add to the group
    this.platforms.add(newObj);
  }

  // create all the red fire
  this.fires_red = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  if (this.levelData.fires_red) {
    for (let i = 0; i < this.levelData.fires_red.length; i++) {
      let curr = this.levelData.fires_red[i];

      let newObj = this.add.sprite(curr.x, curr.y, 'fire_red').setOrigin(0);

      // play burning animation
      newObj.anims.play('burning_red');

      // add to the group
      this.fires_red.add(newObj);
    }
  }

  // create all the blue fire
  this.fires_blue = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  if (this.levelData.fires_blue) {
    for (let i = 0; i < this.levelData.fires_blue.length; i++) {
      let curr = this.levelData.fires_blue[i];

      let newObj = this.add.sprite(curr.x, curr.y, 'fire_blue').setOrigin(0);

      // play burning animation
      newObj.anims.play('burning_blue');

      // add to the group
      this.fires_blue.add(newObj);
    }
  }

  // player
  this.player = this.add.sprite(this.levelData.player_red.x, this.levelData.player_red.y, 'player', 3);
  this.physics.add.existing(this.player);

  // constraint player to the game bounds
  this.player.body.setCollideWorldBounds(true);

  // camera bounds
  this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
  this.cameras.main.startFollow(this.player);

  // goal
  if (this.levelData.goal_red && this.levelData.goal_blue) {
    // Create blue goal
    this.goal_blue = this.add.sprite(this.levelData.goal_blue.x, this.levelData.goal_blue.y, 'goal_blue');
    this.physics.add.existing(this.goal_blue);

    // Create red goal
    this.goal_red = this.add.sprite(this.levelData.goal_red.x, this.levelData.goal_red.y, 'goal_red');
    this.physics.add.existing(this.goal_red);
  }
};

// restart game (game over + you won!)
gameScene.restartGame = function(sourceSprite, targetSprite) {
  // fade out
  this.cameras.main.fade(500);

  // when fade out completes, restart scene
  this.cameras.main.on('camerafadeoutcomplete', function(camera, effect) {
    // restart the scene
    this.scene.restart();
  }, this);
};

// our game's configuration
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
      gravity: {
        y: 1000
      },
      debug: false
    }
  }
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
