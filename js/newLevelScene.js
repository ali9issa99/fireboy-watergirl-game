let newLevelScene = new Phaser.Scene('NewLevelScene');

  // Parameters for our scene
  newLevelScene.init = function () {
    // Player parameters
    this.playerSpeed = 150;
    this.jumpSpeed = -600;
    this.reachedGoalRed = false;
    this.reachedGoalBlue = false;
  };

  // Load asset files for our game
  newLevelScene.preload = function () {
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
    this.load.json('newLevel', 'assets/json/newLevel.json');
  };

  // Executed once, after assets were loaded
  newLevelScene.create = function () {
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
    this.input.on('pointerdown', function (pointer) {
      console.log(pointer.x, pointer.y);
    });

    

    // Add event listeners for the game over screen buttons
    document.getElementById('retryButton').addEventListener('click', () => {
      this.scene.restart();
      document.getElementById('gameOverScreen').classList.add('hidden');
    });

    document.getElementById('exitButton').addEventListener('click', () => {
      // Implement exit functionality, e.g., navigate to another page or close the game
    });
  };

  // Executed on every frame
  newLevelScene.update = function () {
    // Ensure player_red is defined and has a body
    if (this.player_red && this.player_red.body) {
      let onGroundRed = this.player_red.body.blocked.down || this.player_red.body.touching.down;

      // Movement for player_red
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

      // Jumping for player_red
      if (onGroundRed && this.cursors.up.isDown) {
        this.player_red.body.setVelocityY(this.jumpSpeed);
        this.player_red.anims.stop('walking_red');
        this.player_red.setFrame(2);
      }
    }

    // Ensure player_blue is defined and has a body
    if (this.player_blue && this.player_blue.body) {
      let onGroundBlue = this.player_blue.body.blocked.down || this.player_blue.body.touching.down;

      // Movement for player_blue
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

      // Jumping for player_blue
      if (onGroundBlue && this.wasd.up.isDown) {
        this.player_blue.body.setVelocityY(this.jumpSpeed);
        this.player_blue.anims.stop('walking_blue');
        this.player_blue.setFrame(2);
      }
    }
  };

  // Sets up animations for players and fire
  newLevelScene.setupAnimations = function () {
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
  newLevelScene.setupLevel = function () {
    // Load JSON data
    this.newLevel = this.cache.json.get('newLevel');
  
    // Background and camera setup
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    this.cameras.main.setBounds(0, 0, this.newLevel.world.width, this.newLevel.world.height);
  
    // Platforms setup
    this.platforms = this.physics.add.staticGroup();
    this.newLevel.platforms.forEach(platform => {
      if (platform.numTiles === 1) {
        // Single sprite platform
        let obj = this.add.sprite(platform.x, platform.y, platform.key).setOrigin(0);
        this.physics.add.existing(obj, true);
        this.platforms.add(obj);
      } else if (platform.numTiles) {
        // Tile sprite platform
        let width = this.textures.get(platform.key).get(0).width;
        let height = this.textures.get(platform.key).get(0).height;
        let obj = this.add.tileSprite(platform.x, platform.y, platform.numTiles * width, height, platform.key).setOrigin(0);
        this.physics.add.existing(obj, true);
        this.platforms.add(obj);
      } else if (platform.key === 'platform_vertical') {
        // Vertical platform
        let obj = this.add.sprite(platform.x, platform.y, platform.key).setOrigin(0);
        this.physics.add.existing(obj, true);
        this.platforms.add(obj);
      }
    });
  
    // Red fires setup
    this.fires_red = this.physics.add.group();
    if (this.newLevel.fires_red) {
      this.newLevel.fires_red.forEach(fire => {
        let obj = this.add.sprite(fire.x, fire.y, 'fire_red').setOrigin(0);
        obj.anims.play('burning_red');
        this.fires_red.add(obj);
      });
    }
  
    // Blue fires setup
    this.fires_blue = this.physics.add.group();
    if (this.newLevel.fires_blue) {
      this.newLevel.fires_blue.forEach(fire => {
        let obj = this.add.sprite(fire.x, fire.y, 'fire_blue').setOrigin(0);
        obj.anims.play('burning_blue');
        this.fires_blue.add(obj);
      });
    }
  
    // Red goal setup
    if (this.newLevel.goal_red) {
      this.goal_red = this.add.sprite(this.newLevel.goal_red.x, this.newLevel.goal_red.y, 'goal_red');
      this.physics.add.existing(this.goal_red);
    }
  
    // Blue goal setup
    if (this.newLevel.goal_blue) {
      this.goal_blue = this.add.sprite(this.newLevel.goal_blue.x, this.newLevel.goal_blue.y, 'goal_blue');
      this.physics.add.existing(this.goal_blue);
    }
  
    // Player_red setup
    this.player_red = this.physics.add.sprite(this.newLevel.player_red.x, this.newLevel.player_red.y, 'player_red', 3);
    this.player_red.body.setCollideWorldBounds(true);
  
    // Player_blue setup
    this.player_blue = this.physics.add.sprite(this.newLevel.player_blue.x, this.newLevel.player_blue.y, 'player_blue', 3);
    this.player_blue.body.setCollideWorldBounds(true);
  };
  

  // Sets up collision and overlap checks
newLevelScene.setupCollisions = function () {
  // Collisions
  this.physics.add.collider([this.player_red, this.player_blue, this.goal_blue, this.goal_red], this.platforms);
  this.physics.add.collider([this.fires_blue, this.fires_red], this.platforms);

  console.log("before overlap");

  // Overlaps for goal
  this.physics.add.overlap(this.player_red, this.goal_red, this.handleOverlapRed, null, this);
  this.physics.add.overlap(this.player_blue, this.goal_blue, this.handleOverlapBlue, null, this);

  // Overlaps for fires
  this.physics.add.overlap(this.player_red, this.fires_blue, this.handleOverlapRed, null, this);
  this.physics.add.overlap(this.player_blue, this.fires_red, this.handleOverlapBlue, null, this);
};


  // Handles overlap for player_red
  newLevelScene.handleOverlapRed = function (player, target) {
    if (target.texture.key === 'fire_blue') {
      console.log("overlapped with fire blue")
      this.scene.restart();
      // document.getElementById('gameOverScreen').classList.remove('hidden');
    } else if (target.texture.key === 'goal_red') {
      this.reachedGoalRed = true;
      player.body.enable = false; // Disable player physics
      player.setVisible(false); // Hide player
      this.checkGameEnd();
    }
  };

  // Handles overlap for player_blue
  newLevelScene.handleOverlapBlue = function (player, target) {
    if (target.texture.key === 'fire_red') {
      console.log("overlapped with fire blue")
      document.getElementById('gameOverScreen').classList.remove('hidden');
    } else if (target.texture.key === 'goal_blue') {
      this.reachedGoalBlue = true;
      player.body.enable = false;
      player.setVisible(false); 
      this.checkGameEnd();
    }
  };

  // Checks if both players have reached their goals and restarts the game if they have
  newLevelScene.checkGameEnd = function () {
    if (this.reachedGoalRed && this.reachedGoalBlue) {
      this.scene.start('NewLevelScene');
    }
  };

  // Restart game
  newLevelScene.restartGame = function () {
    this.scene.restart();
  };

export default newLevelScene;