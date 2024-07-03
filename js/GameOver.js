export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game-over');
    }

    create() {
        this.add.text(400, 200, 'Game Over', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 300, 'Press SPACE to retry', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);

        const retryButton = this.add.text(400, 400, 'Retry Level', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        retryButton.setInteractive();
        retryButton.on('pointerdown', () => {
            this.scene.restart(); 
        });

        
        const mainMenuButton = this.add.text(400, 450, 'Main Menu', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
        mainMenuButton.setInteractive();
        mainMenuButton.on('pointerdown', () => {
        this.scene.start('gameScene'); 
        });


        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart(); 
        });
        
    }
}
