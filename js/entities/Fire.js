import { ASSETS } from '../config/gameConfig.js';

export class Fire {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type; // 'red' or 'blue'
        
        // Create the fire sprite
        this.sprite = scene.add.sprite(x, y, `fire_${type}`).setOrigin(0);
        scene.physics.add.existing(this.sprite, true); // Set as static
        
        // Setup animations
        this.setupAnimations();
    }

    setupAnimations() {
        if (!this.scene.anims.get(`burning_${this.type}`)) {
            this.scene.anims.create({
                key: `burning_${this.type}`,
                frames: this.scene.anims.generateFrameNames(`fire_${this.type}`, { frames: [0, 1] }),
                frameRate: 4,
                repeat: -1
            });
        }
        this.sprite.anims.play(`burning_${this.type}`);
    }

    getSprite() {
        return this.sprite;
    }
} 