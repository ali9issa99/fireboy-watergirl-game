import 'phaser';

import backBg from '../Assets/back bg.png';
import horizontal from '../Assets/horizontal.png';
import down from '../Assets/down.png';
import vertical from '../Assets/vertical.png';
import left from '../Assets/left.png';
import doorBlue from '../Assets/door blue.png';
import doorRed from '../Assets/door red.png';
import level1 from '../Assets/level1.json';
import Player1 from '../Assets/player_spritesheet.png';

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player1;
let cursors;

function preload() {
    this.load.image('Background', backBg);
    this.load.image('border-up', horizontal);
    this.load.image('border-down', down);
    this.load.image('border-right', vertical);
    this.load.image('border-left', left);
    this.load.image('door-blue', doorBlue);
    this.load.image('door-red', doorRed);
    this.load.tilemapTiledJSON('map', level1);
    this.load.spritesheet('Player1', Player1, {
        frameWidth: 28,
        frameHeight: 30,
        margin: 1,
        spacing: 1
    });
}

function create() {
    const map = this.make.tilemap({ key: 'map' });

    const tileset1 = map.addTilesetImage('Background', 'Background');
    const tileset2 = map.addTilesetImage('border-up', 'border-up');
    const tileset4 = map.addTilesetImage('border-right', 'border-right');
    const tileset5 = map.addTilesetImage('border-left', 'border-left');
    const tileset3 = map.addTilesetImage('border-down', 'border-down');
    const tileset6 = map.addTilesetImage('door-blue', 'door-blue');
    const tileset7 = map.addTilesetImage('door-red', 'door-red');

    const spawnPoint = map.findObject('Player1', obj => obj.name === 'Spawning Point 1');

    const bgLayer = map.createLayer('Background', tileset1, 0, 0);
    const bordersLayer = map.createLayer('Borders', [tileset2, tileset3, tileset4, tileset5, tileset6, tileset7], 0, 0);

    map.setCollisionByProperty({ collides: true });

    map.setCollisionByProperty({ fire: 'fire', water: 'water' });

    player1 = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'Player1');

    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(player1);

    cursors = this.input.keyboard.createCursorKeys();

    player1.setCollideWorldBounds(true);

    this.physics.add.collider(player1, bordersLayer, playerCollideWithTile, null, this);
}

function playerCollideWithTile(player, tile) {
    if (tile.properties.fire === 'fire' || tile.properties.water === 'water') {
        console.log('Player touched fire or water tile');

        this.scene.restart();
    }
}

function update() {

    player1.setVelocity(0);
    if (cursors.left.isDown) {
        player1.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player1.setVelocityX(160);
    }

    if (cursors.up.isDown) {
        player1.setVelocityY(-160);
    } else if (cursors.down.isDown) {
        player1.setVelocityY(160);
    }
}
