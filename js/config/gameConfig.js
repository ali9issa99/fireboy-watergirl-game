export const GAME_CONFIG = {
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
    parent: 'gameContainer',
    title: 'Red Flame Blue Flame',
    pixelArt: false,
    backgroundColor: '000000'
};

export const PLAYER_CONFIG = {
    speed: 150,
    jumpSpeed: -600
};

export const LEVELS = {
    level1: 'level1',
    level2: 'level2',
    level3: 'level3',
    level4: 'level4',
    level5: 'level5',
    // level6: 'level6',
    // level7: 'level7',
    // level8: 'level8',
    // level9: 'level9',
    // level10: 'level10'
};

export const ASSETS = {
    backgrounds: {
        level1: 'background_level1',
        level2: 'background_level2',
        level3: 'background_level3',
        level4: 'background_level4',
        level5: 'background_level5',
        level6: 'background_level1',
        level7: 'background_level2',
        level8: 'background_level3',
        level9: 'background_level4',
        level10: 'background_level5'
    },
    sprites: {
        ground: 'ground',
        platform: 'platform',
        platformVertical: 'platform_vertical',
        block: 'block',
        goalRed: 'door_red',
        goalBlue: 'door_blue',
        barrel: 'barrel'
    },
    players: {
        red: {
            key: 'player_red',
            spritesheet: 'player_red_spritesheet.png',
            frameConfig: {
                frameWidth: 28,
                frameHeight: 30,
                margin: 1,
                spacing: 1
            }
        },
        blue: {
            key: 'player_blue',
            spritesheet: 'player_blue_spritesheet.png',
            frameConfig: {
                frameWidth: 28,
                frameHeight: 30,
                margin: 1,
                spacing: 1
            }
        }
    },
    fires: {
        red: {
            key: 'fire_red',
            spritesheet: 'fire_red_spritesheet.png',
            frameConfig: {
                frameWidth: 20,
                frameHeight: 21,
                margin: 1,
                spacing: 1
            }
        },
        blue: {
            key: 'fire_blue',
            spritesheet: 'fire_blue_spritesheet.png',
            frameConfig: {
                frameWidth: 20,
                frameHeight: 21,
                margin: 1,
                spacing: 1
            }
        }
    }
}; 