import { Player } from '../entities/Player.js';
import { Fire } from '../entities/Fire.js';
import { ASSETS, LEVELS } from '../config/gameConfig.js';
import { AUDIO } from '../config/audioConfig.js';

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
        if (!this.playedLevels.has(this.currentLevel)) {
        this.playedLevels.add(this.currentLevel);
        }
        console.log('Initializing level:', this.currentLevel);
        console.log('Played levels:', Array.from(this.playedLevels));
        this.sounds = {};
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

        // Load audio files
        this.load.audio(AUDIO.background.key, AUDIO.background.path);
        this.load.audio(AUDIO.effects.jump.key, AUDIO.effects.jump.path);
        this.load.audio(AUDIO.effects.gameOver.key, AUDIO.effects.gameOver.path);
        this.load.audio(AUDIO.effects.victory.key, AUDIO.effects.victory.path);
        this.load.audio(AUDIO.effects.menu.key, AUDIO.effects.menu.path);
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

        // Initialize sounds only if they exist in the cache
        this.sounds = {};
        
        if (this.cache.audio.exists(AUDIO.background.key)) {
            this.sounds.background = this.sound.add(AUDIO.background.key, {
                volume: AUDIO.background.volume,
                loop: AUDIO.background.loop
            });
        }
        
        if (this.cache.audio.exists(AUDIO.effects.jump.key)) {
            this.sounds.jump = this.sound.add(AUDIO.effects.jump.key, {
                volume: AUDIO.effects.jump.volume
            });
        }
        
        if (this.cache.audio.exists(AUDIO.effects.gameOver.key)) {
            this.sounds.gameOver = this.sound.add(AUDIO.effects.gameOver.key, {
                volume: AUDIO.effects.gameOver.volume
            });
        }
        
        if (this.cache.audio.exists(AUDIO.effects.victory.key)) {
            this.sounds.victory = this.sound.add(AUDIO.effects.victory.key, {
                volume: AUDIO.effects.victory.volume
            });
        }
        
        if (this.cache.audio.exists(AUDIO.effects.menu.key)) {
            this.sounds.menu = this.sound.add(AUDIO.effects.menu.key, {
                volume: AUDIO.effects.menu.volume
            });
        }

        // Start background music if we're actually starting a game
        const isStartingGame = document.getElementById('gameContainer').style.display === 'block';
        if (isStartingGame && this.sounds.background) {
            this.sounds.background.play();
        }

        // Expose menu sound to menu controls
        if (window.menuControls) {
            window.menuControls.setMenuSound(this.sounds.menu);
        }
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
            if (this.gameOverScreenVisible) return;
            
            if (this.isPaused) {
                this.resumeGame();
            } else {
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
            this.restartLevel();
            document.getElementById('gameOverScreen').classList.add('hidden');
            window.menuControls.setActiveMenu(null);
        };

        this.exitListener = () => {
            this.sounds.background?.stop();
            location.reload();
        };

        document.getElementById('retryButton').addEventListener('click', this.retryListener);
        document.getElementById('gameOverExitButton').addEventListener('click', this.exitListener);

        // Update game over text
        const gameOverTitle = document.querySelector('#gameOverScreen h2');
        if (gameOverTitle) {
            gameOverTitle.textContent = 'You Died!';
        }

        // Victory UI
        document.getElementById('playAgainButton').removeEventListener('click', this.playAgainListener);
        document.getElementById('victoryExitButton').removeEventListener('click', this.victoryExitListener);

        this.playAgainListener = () => {
            document.getElementById('victoryScreen').classList.add('hidden');
            window.menuControls.setActiveMenu(null);
            this.startFromBeginning();
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
        document.getElementById('restartButton').removeEventListener('click', this.restartListener);
        document.getElementById('exitToMenuButton').removeEventListener('click', this.exitToMenuListener);

        this.pauseListener = () => {
            if (!this.isPaused && !this.gameOverScreenVisible) {
            this.pauseGame();
            }
        };

        this.resumeListener = () => {
            if (this.isPaused) {
            this.resumeGame();
            }
        };

        this.restartListener = () => {
            if (this.isPaused) {
                this.restartLevel();
            }
        };

        this.exitToMenuListener = () => {
            if (this.isPaused) {
            this.exitToMenu();
            }
        };

        document.getElementById('pauseButton').addEventListener('click', this.pauseListener);
        document.getElementById('resumeButton').addEventListener('click', this.resumeListener);
        document.getElementById('restartButton').addEventListener('click', this.restartListener);
        document.getElementById('exitToMenuButton').addEventListener('click', this.exitToMenuListener);
    }

    gameOver() {
        if (this.gameOverScreenVisible) return;
        
        this.gameOverScreenVisible = true;
        this.sounds.background?.stop();
        this.sounds.gameOver?.play();
        
        this.physics.pause();
        this.input.keyboard.enabled = true; // Keep keyboard enabled for menu navigation
        this.player_red.sprite.anims.stop();
        this.player_blue.sprite.anims.stop();
        document.getElementById('gameOverScreen').classList.remove('hidden');

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
    }

    handleGoalRed(player, goal) {
        if (goal.texture.key === ASSETS.sprites.goalRed) {
            if (!this.reachedGoalRed) {
            this.reachedGoalRed = true;
            player.body.enable = false;
            player.setVisible(false);
            this.checkGameEnd();
            }
        }
    }

    handleGoalBlue(player, goal) {
        if (goal.texture.key === ASSETS.sprites.goalBlue) {
            if (!this.reachedGoalBlue) {
            this.reachedGoalBlue = true;
            player.body.enable = false;
            player.setVisible(false);
            this.checkGameEnd();
            }
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
                
                // Small delay to ensure all cleanup is complete
                this.time.delayedCall(100, () => {
                    this.loadNextLevel(nextLevel);
                });
            } else {
                // This is the last level, show victory screen
                console.log('All levels completed!');
                this.showVictoryScreen();
            }
        }
    }

    loadNextLevel(nextLevel) {
        // Update current level
        this.currentLevel = nextLevel;
        this.reachedGoalRed = false;
        this.reachedGoalBlue = false;
        
        // Load new level data
        this.levelData = this.cache.json.get(this.currentLevel);
        
        // Clear existing game objects
        if (this.player_red) {
            this.player_red.sprite.destroy();
            this.player_red = null;
        }
        if (this.player_blue) {
            this.player_blue.sprite.destroy();
            this.player_blue = null;
        }
        if (this.fires) {
            Object.values(this.fires).forEach(group => {
                group.getChildren().forEach(fire => fire.destroy());
                group.clear(true, true);
            });
            this.fires = null;
        }
        if (this.platforms) {
            this.platforms.getChildren().forEach(platform => platform.destroy());
            this.platforms.clear(true, true);
            this.platforms = null;
        }
        if (this.goal_red) {
            this.goal_red.destroy();
            this.goal_red = null;
        }
        if (this.goal_blue) {
            this.goal_blue.destroy();
            this.goal_blue = null;
        }
        
        // Clear any existing background
        this.children.list.forEach(child => {
            if (child.type === 'Image') {
                child.destroy();
            }
        });
        
        // Update background
        const backgroundKey = this.levelData.world.background;
        this.add.image(0, 0, backgroundKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Set up camera bounds
        this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
        
        // Set up new level elements
        this.setupPlatforms();
        this.setupPlayers();
        this.setupFires();
        this.setupGoals();
        this.setupCollisions();
        
        // Reset physics
        this.physics.resume();
        
        // Reset game state
        this.gameOverScreenVisible = false;
        this.isPaused = false;
        
        // Ensure input is enabled
        this.input.keyboard.enabled = true;
    }

    showVictoryScreen() {
        this.physics.pause();
        this.input.keyboard.enabled = true;
        this.player_red.sprite.anims.stop();
        this.player_blue.sprite.anims.stop();

        // Stop background music
        this.sounds.background?.stop();

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

        // Calculate levels completed based on starting level
        const levelKeys = Object.keys(LEVELS);
        const startingLevelIndex = levelKeys.findIndex(key => LEVELS[key] === this.playedLevels.values().next().value);
        const totalLevels = levelKeys.length - startingLevelIndex;

        // Update stats
        document.getElementById('levelsCompleted').textContent = totalLevels;
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
        
        // Play victory sound if it exists
        this.sounds.victory?.play();
    }

    pauseGame() {
        if (this.isPaused || this.gameOverScreenVisible) return;
        
        console.log('Pausing game...');
        this.isPaused = true;
        
        // Pause game systems
        this.physics.pause();
        this.sounds.background?.pause();
        this.sounds.menu.play();
        
        // Show pause menu
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.remove('hidden');
        pauseMenu.style.display = 'flex';
        window.menuControls.setActiveMenu('pauseMenu');
        
        // Focus the resume button
        const resumeButton = document.getElementById('resumeButton');
        if (resumeButton) {
            resumeButton.focus();
        }
        
        // Start tracking pause time
        this.pauseStartTime = Date.now();
        
        console.log('Game paused, menu should be visible');
    }

    resumeGame() {
        if (!this.isPaused) return;
        
        console.log('Resuming game...');
        this.isPaused = false;
        
        // Resume game systems
        this.physics.resume();
        this.sounds.background?.resume();
        this.sounds.menu.play();
        
        // Hide pause menu
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.add('hidden');
        pauseMenu.style.display = 'none';
        window.menuControls.setActiveMenu(null);
        
        // Update pause time tracking
        if (this.pauseStartTime) {
            this.totalPauseTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = null;
        }
        
        console.log('Game resumed');
    }

    restartLevel() {
        console.log('Restarting level...');
        
        // Reset game state
        this.isPaused = false;
        this.gameOverScreenVisible = false;
        
        // Hide any visible menus
        const pauseMenu = document.getElementById('pauseMenu');
        const victoryScreen = document.getElementById('victoryScreen');
        if (pauseMenu) {
            pauseMenu.classList.add('hidden');
            pauseMenu.style.display = 'none';
        }
        if (victoryScreen) {
            victoryScreen.classList.add('hidden');
        }
        window.menuControls.setActiveMenu(null);
        
        // Stop and restart background music
        if (this.sounds.background) {
            this.sounds.background.stop();
            this.sounds.background.play();
        }
        
        // Reset level state
        this.reachedGoalRed = false;
        this.reachedGoalBlue = false;
        
        // Clear existing game objects
        if (this.player_red) {
            this.player_red.sprite.destroy();
            this.player_red = null;
        }
        if (this.player_blue) {
            this.player_blue.sprite.destroy();
            this.player_blue = null;
        }
        if (this.fires) {
            Object.values(this.fires).forEach(group => {
                group.getChildren().forEach(fire => fire.destroy());
                group.clear(true, true);
            });
            this.fires = null;
        }
        if (this.platforms) {
            this.platforms.getChildren().forEach(platform => platform.destroy());
            this.platforms.clear(true, true);
            this.platforms = null;
        }
        if (this.goal_red) {
            this.goal_red.destroy();
            this.goal_red = null;
        }
        if (this.goal_blue) {
            this.goal_blue.destroy();
            this.goal_blue = null;
        }
        
        // Clear any existing background
        this.children.list.forEach(child => {
            if (child.type === 'Image') {
                child.destroy();
            }
        });
        
        // Load level data
        this.levelData = this.cache.json.get(this.currentLevel);
        
        // Update background
        const backgroundKey = this.levelData.world.background;
        this.add.image(0, 0, backgroundKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Set up camera bounds
        this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
        
        // Set up new level elements
        this.setupPlatforms();
        this.setupPlayers();
        this.setupFires();
        this.setupGoals();
        this.setupCollisions();
        
        // Reset physics and input
        this.physics.resume();
        this.input.keyboard.enabled = true;
        
        console.log('Level restarted successfully');
        console.log('Current played levels:', Array.from(this.playedLevels));
    }

    exitToMenu() {
        if (!this.isPaused) return;
        
        console.log('Exiting to menu...');
        
        // Stop all sounds
        if (this.sounds) {
            Object.values(this.sounds).forEach(sound => {
                if (sound && sound.stop) {
                    sound.stop();
                }
            });
        }
        
        // Hide pause menu
        const pauseMenu = document.getElementById('pauseMenu');
        pauseMenu.classList.add('hidden');
        pauseMenu.style.display = 'none';
        
        // Hide game container and show landing page
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('landingPage').style.display = 'block';
        document.getElementById('pauseButton').classList.add('hidden');
        
        // Clean up event listeners
        this.cleanupEventListeners();
        
        // Destroy all game objects
        if (this.player_red) this.player_red.destroy();
        if (this.player_blue) this.player_blue.destroy();
        if (this.fires) {
            Object.values(this.fires).forEach(group => group.clear(true, true));
        }
        if (this.platforms) this.platforms.clear(true, true);
        
        // Stop and remove the game scene
        this.scene.stop();
        this.scene.remove();
        
        // Clear any remaining game state
        window.menuControls.setActiveMenu(null);
        
        // Force a garbage collection of the scene
        this.sounds = null;
        this.player_red = null;
        this.player_blue = null;
        this.fires = null;
        this.platforms = null;
        this.levelData = null;
    }

    cleanupEventListeners() {
        // Remove all keyboard listeners
        this.input.keyboard.removeAllListeners();
        
        // Remove all input listeners
        this.input.removeAllListeners();
        
        // Remove UI event listeners
        const elements = [
            'retryButton',
            'gameOverExitButton',
            'playAgainButton',
            'victoryExitButton',
            'pauseButton',
            'resumeButton',
            'restartButton',
            'exitToMenuButton'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            }
        });
    }

    destroy() {
        console.log('Destroying game scene...');
        
        // Stop all sounds
        if (this.sounds) {
            Object.values(this.sounds).forEach(sound => {
                if (sound && sound.stop) {
                    sound.stop();
                }
            });
        }
        
        // Clean up event listeners
        this.cleanupEventListeners();
        
        // Clear all game objects
        if (this.player_red) this.player_red.destroy();
        if (this.player_blue) this.player_blue.destroy();
        if (this.fires) {
            Object.values(this.fires).forEach(group => group.clear(true, true));
        }
        if (this.platforms) this.platforms.clear(true, true);
        
        // Clear any remaining game state
        this.sounds = {};
        this.isPaused = false;
        this.gameOverScreenVisible = false;
        
        // Call parent destroy
        super.destroy();
    }

    startFromBeginning() {
        console.log('Starting game from beginning...');
        
        // Reset game state
        this.isPaused = false;
        this.gameOverScreenVisible = false;
        this.startTime = Date.now();
        this.totalPauseTime = 0;
        this.playedLevels = new Set([LEVELS.level1]); // Start with just level 1
        
        // Hide victory screen
        const victoryScreen = document.getElementById('victoryScreen');
        if (victoryScreen) {
            victoryScreen.classList.add('hidden');
        }
        window.menuControls.setActiveMenu(null);
        
        // Stop and restart background music
        if (this.sounds.background) {
            this.sounds.background.stop();
            this.sounds.background.play();
        }
        
        // Reset level state
        this.reachedGoalRed = false;
        this.reachedGoalBlue = false;
        this.currentLevel = LEVELS.level1;
        
        // Clear existing game objects
        if (this.player_red) {
            this.player_red.sprite.destroy();
            this.player_red = null;
        }
        if (this.player_blue) {
            this.player_blue.sprite.destroy();
            this.player_blue = null;
        }
        if (this.fires) {
            Object.values(this.fires).forEach(group => {
                group.getChildren().forEach(fire => fire.destroy());
                group.clear(true, true);
            });
            this.fires = null;
        }
        if (this.platforms) {
            this.platforms.getChildren().forEach(platform => platform.destroy());
            this.platforms.clear(true, true);
            this.platforms = null;
        }
        if (this.goal_red) {
            this.goal_red.destroy();
            this.goal_red = null;
        }
        if (this.goal_blue) {
            this.goal_blue.destroy();
            this.goal_blue = null;
        }
        
        // Clear any existing background
        this.children.list.forEach(child => {
            if (child.type === 'Image') {
                child.destroy();
            }
        });
        
        // Load level data
        this.levelData = this.cache.json.get(this.currentLevel);
        
        // Update background
        const backgroundKey = this.levelData.world.background;
        this.add.image(0, 0, backgroundKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Set up camera bounds
        this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
        
        // Set up new level elements
        this.setupPlatforms();
        this.setupPlayers();
        this.setupFires();
        this.setupGoals();
        this.setupCollisions();
        
        // Reset physics and input
        this.physics.resume();
        this.input.keyboard.enabled = true;
        
        console.log('Game restarted from beginning');
        console.log('Current played levels:', Array.from(this.playedLevels));
    }

    // Add method to play menu sound
    playMenuSound() {
        this.sounds.menu?.play();
    }
} 