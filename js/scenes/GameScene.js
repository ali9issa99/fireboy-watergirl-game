import { Player } from '../entities/Player.js';
import { Fire } from '../entities/Fire.js';
import { ASSETS, LEVELS } from '../config/gameConfig.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
    }

    init(data) {
        this.currentLevel = data.level || LEVELS.level1;
        this.reachedGoalRed = false;
        this.reachedGoalBlue = false;
        this.gameOverScreenVisible = false;
        this.isPaused = false;
        this.startTime = data.startTime || Date.now();
        this.pauseStartTime = null;
        this.totalPauseTime = data.totalPauseTime || 0;
        this.playedLevels = new Set(data.playedLevels || []);
        this.playedLevels.add(this.currentLevel);
        console.log('Initializing level:', this.currentLevel);
        console.log('Played levels:', Array.from(this.playedLevels));
    }

    preload() {
        console.log('Preloading assets...');
        
        // Load backgrounds
        Object.entries(ASSETS.backgrounds).forEach(([level, key]) => {
            console.log('Loading background:', key);
            this.load.image(key, `assets/images/${key}.png`);
        });

        // Load sprites
        Object.entries(ASSETS.sprites).forEach(([key, value]) => {
            console.log('Loading sprite:', value);
            this.load.image(value, `assets/images/${value}.png`);
        });

        // Load player spritesheets
        Object.entries(ASSETS.players).forEach(([type, config]) => {
            console.log('Loading player spritesheet:', config.spritesheet);
            this.load.spritesheet(config.key, `assets/images/${config.spritesheet}`, config.frameConfig);
        });

        // Load fire spritesheets
        Object.entries(ASSETS.fires).forEach(([type, config]) => {
            console.log('Loading fire spritesheet:', config.spritesheet);
            this.load.spritesheet(config.key, `assets/images/${config.spritesheet}`, config.frameConfig);
        });

        // Load level data
        Object.values(LEVELS).forEach(level => {
            console.log('Loading level data:', level);
            this.load.json(level, `assets/json/${level}.json`);
        });
    }

    create() {
        console.log('Creating game scene...');
        
        // Load level data
        this.levelData = this.cache.json.get(this.currentLevel);
        console.log('Level data loaded:', this.levelData);

        // Set up background
        const backgroundKey = this.levelData.world.background;
        console.log('Setting up background:', backgroundKey);
        this.add.image(0, 0, backgroundKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Set up camera bounds
        this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);

        // Set up platforms
        this.setupPlatforms();

        // Set up players
        this.setupPlayers();

        // Set up fires
        this.setupFires();

        // Set up goals
        this.setupGoals();

        // Set up collisions
        this.setupCollisions();

        // Set up input
        this.setupInput();

        // Set up UI event listeners
        this.setupUI();

        // Show pause button
        document.getElementById('pauseButton').classList.remove('hidden');
    }

    update() {
        if (this.gameOverScreenVisible || this.isPaused) return;

        // Update players
        this.player_red.update();
        this.player_blue.update();
    }

    setupPlatforms() {
        this.platforms = this.physics.add.staticGroup();
        this.levelData.platforms.forEach(platform => {
            if (platform.numTiles === 1) {
                let obj = this.add.sprite(platform.x, platform.y, platform.key).setOrigin(0);
                this.physics.add.existing(obj, true);
                this.platforms.add(obj);
            } else {
                let width = this.textures.get(platform.key).get(0).width;
                let height = this.textures.get(platform.key).get(0).height;
                let obj = this.add.tileSprite(platform.x, platform.y, platform.numTiles * width, height, platform.key).setOrigin(0);
                this.physics.add.existing(obj, true);
                this.platforms.add(obj);
            }
        });
    }

    setupPlayers() {
        // Create red player (arrow keys)
        this.player_red = new Player(
            this,
            this.levelData.player_red.x,
            this.levelData.player_red.y,
            'red',
            this.input.keyboard.createCursorKeys()
        );

        // Create blue player (WASD)
        this.player_blue = new Player(
            this,
            this.levelData.player_blue.x,
            this.levelData.player_blue.y,
            'blue',
            this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            })
        );
    }

    setupFires() {
        this.fires = {
            red: this.physics.add.staticGroup(),
            blue: this.physics.add.staticGroup()
        };

        // Set up red fires
        if (this.levelData.fires_red) {
            this.levelData.fires_red.forEach(fire => {
                let fireObj = new Fire(this, fire.x, fire.y, 'red');
                this.fires.red.add(fireObj.sprite);
            });
        }

        // Set up blue fires
        if (this.levelData.fires_blue) {
            this.levelData.fires_blue.forEach(fire => {
                let fireObj = new Fire(this, fire.x, fire.y, 'blue');
                this.fires.blue.add(fireObj.sprite);
            });
        }
    }

    setupGoals() {
        // Set up red goal
        if (this.levelData.goal_red) {
            this.goal_red = this.add.sprite(this.levelData.goal_red.x, this.levelData.goal_red.y, ASSETS.sprites.goalRed);
            this.physics.add.existing(this.goal_red, true);
        }

        // Set up blue goal
        if (this.levelData.goal_blue) {
            this.goal_blue = this.add.sprite(this.levelData.goal_blue.x, this.levelData.goal_blue.y, ASSETS.sprites.goalBlue);
            this.physics.add.existing(this.goal_blue, true);
        }
    }

    setupCollisions() {
        // Platform collisions for players
        this.physics.add.collider([this.player_red.sprite, this.player_blue.sprite], this.platforms);

        // Fire overlaps (game over conditions)
        this.physics.add.overlap(this.player_red.sprite, this.fires.blue, this.gameOver, null, this);
        this.physics.add.overlap(this.player_blue.sprite, this.fires.red, this.gameOver, null, this);

        // Goal overlaps
        this.physics.add.overlap(this.player_red.sprite, this.goal_red, this.handleGoalRed, null, this);
        this.physics.add.overlap(this.player_blue.sprite, this.goal_blue, this.handleGoalBlue, null, this);
    }

    setupInput() {
        // Debug pointer position
        this.input.on('pointerdown', function (pointer) {
            console.log(pointer.x, pointer.y);
        });

        // Add keyboard shortcuts
        this.keys = this.input.keyboard.addKeys({
            esc: Phaser.Input.Keyboard.KeyCodes.ESC,
            r: Phaser.Input.Keyboard.KeyCodes.R
        });

        // ESC key to toggle pause menu
        this.input.keyboard.on('keydown-ESC', () => {
            console.log('ESC pressed, gameOverScreenVisible:', this.gameOverScreenVisible);
            if (this.gameOverScreenVisible) return;
            
            if (this.isPaused) {
                console.log('Resuming game from keyboard');
                this.resumeGame();
            } else {
                console.log('Pausing game from keyboard');
                this.pauseGame();
            }
        });

        // R key to restart level
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOverScreenVisible) {
                this.retryListener();
            } else if (this.isPaused) {
                this.restartLevel();
            }
        });
    }

    setupUI() {
        // Game over UI
        document.getElementById('retryButton').removeEventListener('click', this.retryListener);
        document.getElementById('gameOverExitButton').removeEventListener('click', this.exitListener);

        this.retryListener = () => {
            this.gameOverScreenVisible = false;
            this.input.keyboard.enabled = true;
            this.physics.resume();
            this.scene.restart({ 
                level: this.currentLevel,
                playedLevels: Array.from(this.playedLevels),
                startTime: this.startTime,
                totalPauseTime: this.totalPauseTime
            });
            document.getElementById('gameOverScreen').classList.add('hidden');
            window.menuControls.setActiveMenu(null);
        };

        this.exitListener = () => {
            location.reload();
        };

        document.getElementById('retryButton').addEventListener('click', this.retryListener);
        document.getElementById('gameOverExitButton').addEventListener('click', this.exitListener);

        // Victory UI
        document.getElementById('playAgainButton').removeEventListener('click', this.playAgainListener);
        document.getElementById('victoryExitButton').removeEventListener('click', this.victoryExitListener);

        this.playAgainListener = () => {
            document.getElementById('victoryScreen').classList.add('hidden');
            window.menuControls.setActiveMenu(null);
            this.scene.restart({ 
                level: this.currentLevel,
                playedLevels: Array.from(this.playedLevels),
                startTime: this.startTime,
                totalPauseTime: this.totalPauseTime
            });
        };

        this.victoryExitListener = () => {
            document.getElementById('victoryScreen').classList.add('hidden');
            window.menuControls.setActiveMenu(null); // Clear active menu
            location.reload();
        };

        document.getElementById('playAgainButton').addEventListener('click', this.playAgainListener);
        document.getElementById('victoryExitButton').addEventListener('click', this.victoryExitListener);

        // Pause UI
        document.getElementById('pauseButton').removeEventListener('click', this.pauseListener);
        document.getElementById('resumeButton').removeEventListener('click', this.resumeListener);
        this.restartListener = () => {
            console.log('Restart button clicked');
            this.isPaused = false;
            this.physics.resume();
            this.input.keyboard.enabled = true;
            
            // Hide the pause menu
            const pauseMenu = document.getElementById('pauseMenu');
            pauseMenu.classList.add('hidden');
            pauseMenu.style.display = 'none';
            window.menuControls.setActiveMenu(null);
            
            // Restart the scene
            this.scene.restart({ 
                level: this.currentLevel,
                playedLevels: Array.from(this.playedLevels),
                startTime: this.startTime,
                totalPauseTime: this.totalPauseTime
            });
        };
        document.getElementById('exitToMenuButton').removeEventListener('click', this.exitToMenuListener);

        this.pauseListener = () => {
            console.log('Pause button clicked');
            this.pauseGame();
        };

        this.resumeListener = () => {
            console.log('Resume button clicked');
            this.resumeGame();
        };

        this.exitToMenuListener = () => {
            console.log('Exit to menu button clicked');
            this.exitToMenu();
        };

        document.getElementById('pauseButton').addEventListener('click', this.pauseListener);
        document.getElementById('resumeButton').addEventListener('click', this.resumeListener);
        document.getElementById('restartButton').addEventListener('click', this.restartListener);
        document.getElementById('exitToMenuButton').addEventListener('click', this.exitToMenuListener);
    }

    gameOver() {
        this.physics.pause();
        this.input.keyboard.enabled = true; // Keep keyboard enabled for menu navigation
        this.player_red.sprite.anims.stop();
        this.player_blue.sprite.anims.stop();
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.gameOverScreenVisible = true;

        // Set up menu controls for game over screen
        window.menuControls.setActiveMenu('gameOverScreen');

        // Focus the retry button
        const retryButton = document.getElementById('retryButton');
        if (retryButton) {
            retryButton.focus();
        }

        // Add keyboard navigation for game over screen
        this.input.keyboard.on('keydown-R', () => {
            this.retryListener();
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.exitListener();
        });
    }

    handleGoalRed(player, goal) {
        if (goal.texture.key === ASSETS.sprites.goalRed) {
            this.reachedGoalRed = true;
            player.body.enable = false;
            player.setVisible(false);
            this.checkGameEnd();
        }
    }

    handleGoalBlue(player, goal) {
        if (goal.texture.key === ASSETS.sprites.goalBlue) {
            this.reachedGoalBlue = true;
            player.body.enable = false;
            player.setVisible(false);
            this.checkGameEnd();
        }
    }

    checkGameEnd() {
        if (this.reachedGoalRed && this.reachedGoalBlue) {
            console.log('Both players reached goals. Checking for next level.');
            
            // Get all level keys and find the current level's index
            const levelKeys = Object.keys(LEVELS);
            const currentLevelIndex = levelKeys.findIndex(key => LEVELS[key] === this.currentLevel);
            
            // If there's a next level, go to it
            if (currentLevelIndex < levelKeys.length - 1) {
                const nextLevelKey = levelKeys[currentLevelIndex + 1];
                const nextLevel = LEVELS[nextLevelKey];
                console.log('Switching to next level:', nextLevel);
                this.scene.restart({ 
                    level: nextLevel,
                    playedLevels: Array.from(this.playedLevels),
                    startTime: this.startTime,
                    totalPauseTime: this.totalPauseTime
                });
            } else {
                // This is the last level, show victory screen
                console.log('All levels completed!');
                this.showVictoryScreen();
            }
        }
    }

    showVictoryScreen() {
        this.physics.pause();
        this.input.keyboard.enabled = true;
        this.player_red.sprite.anims.stop();
        this.player_blue.sprite.anims.stop();

        // Add any remaining pause time if the game was paused
        if (this.pauseStartTime) {
            this.totalPauseTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = null;
        }

        // Calculate total time from game start, subtracting total pause time
        const totalTime = Math.floor((Date.now() - this.startTime - this.totalPauseTime) / 1000);
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Update stats
        document.getElementById('levelsCompleted').textContent = this.playedLevels.size;
        document.getElementById('totalTime').textContent = timeString;

        // Show victory screen
        document.getElementById('victoryScreen').classList.remove('hidden');

        // Set up menu controls for victory screen
        window.menuControls.setActiveMenu('victoryScreen');

        // Focus the play again button
        const playAgainButton = document.getElementById('playAgainButton');
        if (playAgainButton) {
            playAgainButton.focus();
        }
    }

    pauseGame() {
        console.log('Pausing game...');
        this.isPaused = true;
        this.physics.pause();
        this.input.keyboard.enabled = true; // Keep keyboard enabled for menu navigation
        
        // Start tracking pause time
        this.pauseStartTime = Date.now();
        
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.remove('hidden');
        pauseMenu.style.display = 'flex';
        window.menuControls.setActiveMenu('pauseMenu');
        
        // Focus the resume button
        const resumeButton = document.getElementById('resumeButton');
        if (resumeButton) {
            resumeButton.focus();
        }
        console.log('Game paused, menu should be visible');
    }

    resumeGame() {
        console.log('Resuming game...');
        this.isPaused = false;
        this.physics.resume();
        this.input.keyboard.enabled = true; // Keep keyboard enabled
        
        // Add the current pause duration to total pause time
        if (this.pauseStartTime) {
            this.totalPauseTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = null;
        }
        
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.add('hidden');
        pauseMenu.style.display = 'none';
        window.menuControls.setActiveMenu(null); // Clear active menu
        console.log('Game resumed');
    }

    restartLevel() {
        this.isPaused = false;
        this.physics.resume();
        this.input.keyboard.enabled = true;
        document.getElementById('pauseMenu').classList.add('hidden');
        this.scene.restart({ level: this.currentLevel });
    }

    exitToMenu() {
        document.getElementById('pauseMenu').classList.add('hidden');
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('landingPage').style.display = 'block';
        document.getElementById('pauseButton').classList.add('hidden');
        location.reload();
    }
} 