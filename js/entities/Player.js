import { PLAYER_CONFIG } from '../config/gameConfig.js';

export class Player {
    constructor(scene, x, y, type, controls) {
        this.scene = scene;
        this.type = type; // 'red' or 'blue'
        this.controls = controls;
        this.speed = PLAYER_CONFIG.speed;
        this.jumpSpeed = PLAYER_CONFIG.jumpSpeed;
        
        // Create the player sprite
        this.sprite = scene.add.sprite(x, y, `player_${type}`, 3);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Setup animations
        this.setupAnimations();
    }

    setupAnimations() {
        if (!this.scene.anims.get(`walking_${this.type}`)) {
            this.scene.anims.create({
                key: `walking_${this.type}`,
                frames: this.scene.anims.generateFrameNames(`player_${this.type}`, { frames: [0, 1, 2] }),
                frameRate: 12,
                yoyo: true,
                repeat: -1
            });
        }
    }

    update() {
        const onGround = this.sprite.body.blocked.down || this.sprite.body.touching.down;

        // Handle horizontal movement
        if (this.controls.left.isDown) {
            this.sprite.body.setVelocityX(-this.speed);
            this.sprite.flipX = false;
            if (onGround && !this.sprite.anims.isPlaying) {
                this.sprite.anims.play(`walking_${this.type}`);
            }
        } else if (this.controls.right.isDown) {
            this.sprite.body.setVelocityX(this.speed);
            this.sprite.flipX = true;
            if (onGround && !this.sprite.anims.isPlaying) {
                this.sprite.anims.play(`walking_${this.type}`);
            }
        } else {
            this.sprite.body.setVelocityX(0);
            this.sprite.anims.stop(`walking_${this.type}`);
            if (onGround) {
                this.sprite.setFrame(3);
            }
        }

        // Handle jumping
        if (onGround && this.controls.up.isDown) {
            this.sprite.body.setVelocityY(this.jumpSpeed);
            this.sprite.anims.stop(`walking_${this.type}`);
            this.sprite.setFrame(2);
            // Play jump sound
            this.scene.sounds.jump.play();
        }
    }

    disable() {
        this.sprite.body.enable = false;
        this.sprite.setVisible(false);
    }

    enable() {
        this.sprite.body.enable = true;
        this.sprite.setVisible(true);
    }
} 