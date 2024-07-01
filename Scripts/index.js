import 'phaser';

// Import all your assets
import backBg from '../assets/back bg.png';
import horizontal from '../assets/horizontal.png';
import down from '../assets/down.png';
import vertical from '../assets/vertical.png';
import left from '../assets/left.png';
import doorBlue from '../assets/door blue.png';
import doorRed from '../assets/door red.png';
import level1 from '../assets/level1.json';

function preload() {
    this.load.image('Background', backBg);
    this.load.image('border-up', horizontal);
    this.load.image('border-down', down);
    this.load.image('border-right', vertical);
    this.load.image('border-left', left);
    this.load.image('door-blue', doorBlue);
    this.load.image('door-red', doorRed);


    this.load.tilemapTiledJSON('map', level1);
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


    const bgLayer = map.createLayer('Background', tileset1, 0, 0);
    const bordersLayer = map.createLayer('Borders', [tileset2, tileset3, tileset4, tileset5, tileset6, tileset7], 0, 0);


    const camera = this.cameras.main;
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}

function update() {

}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
