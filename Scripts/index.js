import 'phaser'

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var logo;

function preload ()
{
    this.load.image('logo', 'Assets/logo.png');
}


function create ()
{
    logo = this.add.image(400, 200, 'logo');
}

function update ()
{
    logo.rotation += 0.01;
}
