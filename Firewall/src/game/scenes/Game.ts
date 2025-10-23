import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { RunnerPlayer } from '../objects/RunnerPlayer';
import { Laser, LaserHeight } from '../objects/Laser';
import { DiamondSpawner } from '../objects/DiamondSpawner';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    player!: RunnerPlayer;
    ground!: Phaser.GameObjects.Rectangle;
    lasers: Laser[] = [];
    diamondSpawner!: DiamondSpawner;

    // Game state
    private scrollSpeed: number = 300; // pixels per second
    private distance: number = 0;
    private score: number = 0;
    private readonly GROUND_Y = 900;

    // Obstacle spawning
    private obstacleSpawnTimer: number = 0;
    private obstacleSpawnInterval: number = 2000; // milliseconds

    // UI
    private scoreText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private helpText!: Phaser.GameObjects.Text;

    // Collision
    private collisionGroup!: Phaser.Physics.Arcade.Group;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x0a0a1a);

        // Create ground
        this.ground = this.add.rectangle(960, this.GROUND_Y, 1920, 4, 0x4a4a4a);
        this.physics.add.existing(this.ground, true); // Static body

        // Create player
        this.player = new RunnerPlayer(this, this.GROUND_Y);

        // Enable collision between player and ground
        this.physics.add.collider(this.player.getSprite(), this.ground);

        // Create collision group for lasers
        this.collisionGroup = this.physics.add.group();

        // Create diamond spawner
        this.diamondSpawner = new DiamondSpawner(this, this.GROUND_Y, this.scrollSpeed);

        // Setup UI
        this.setupUI();

        // Reset game state
        this.distance = 0;
        this.score = 0;
        this.obstacleSpawnTimer = 0;
        this.lasers = [];

        EventBus.emit('current-scene-ready', this);
    }

    private setupUI(): void {
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(1000);

        this.distanceText = this.add.text(16, 56, 'Distance: 0m', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(1000);

        this.helpText = this.add.text(960, 100, 'FIREWALL - Endless Runner\n\nSPACE/W/↑ - Jump\nSHIFT/S/↓ - Slide\n\nWatch for YELLOW warnings!\nJump over LOW lasers, Slide under HIGH lasers', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(1000);

        // Hide help text after 5 seconds
        this.time.delayedCall(5000, () => {
            this.helpText.setAlpha(0);
        });
    }

    update(_time: number, delta: number): void
    {
        // Update player
        this.player.update(delta);

        // Update distance traveled
        this.distance += (this.scrollSpeed * delta) / 1000;
        this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`);

        // Update obstacle spawning
        this.updateObstacleSpawning(delta);

        // Update lasers
        this.updateLasers(delta);

        // Update diamond spawner
        this.diamondSpawner.update(delta, this.distance);

        // Check collisions
        this.checkCollisions();
    }

    private updateObstacleSpawning(delta: number): void {
        this.obstacleSpawnTimer += delta;

        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.spawnLaser();
            this.obstacleSpawnTimer = 0;

            // Gradually increase difficulty
            if (this.obstacleSpawnInterval > 1000) {
                this.obstacleSpawnInterval -= 50; // Spawn more frequently over time
            }
        }
    }

    private spawnLaser(): void {
        // Randomly choose laser height
        const rand = Math.random();
        let height: LaserHeight;

        if (rand < 0.4) {
            height = 'ground'; // 40% - Jump over
        } else if (rand < 0.7) {
            height = 'high';   // 30% - Slide under
        } else {
            height = 'middle'; // 30% - Either jump or slide
        }

        const x = 2000; // Spawn off-screen to the right

        const laser = new Laser(this, x, this.GROUND_Y, height, this.scrollSpeed);
        this.lasers.push(laser);

        // Add to collision group
        this.collisionGroup.add(laser.sprite);

        console.log(`Spawned ${height} laser at x=${x}`);
    }

    private updateLasers(delta: number): void {
        // Update all lasers and remove off-screen ones
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.update(delta);

            if (laser.isOffScreen()) {
                this.collisionGroup.remove(laser.sprite);
                laser.destroy();
                this.lasers.splice(i, 1);
            }
        }
    }

    private checkCollisions(): void {
        // Check overlap between player and lasers
        this.physics.overlap(
            this.player.getSprite(),
            this.collisionGroup,
            this.handleLaserCollision,
            undefined,
            this
        );

        // Check overlap between player and diamonds
        this.physics.overlap(
            this.player.getSprite(),
            this.diamondSpawner.diamondsGroup,
            this.handleDiamondCollision,
            undefined,
            this
        );
    }

    private handleLaserCollision(): void {
        console.log('COLLISION DETECTED!');
        // TODO: Trigger QTE system
        // For now, just log and continue
        // In Phase 2, this will pause game and show QTE overlay

        // Increment score as placeholder
        this.score += 1;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    private handleDiamondCollision(_player: any, diamondSprite: any): void {
        const sprite = diamondSprite as Phaser.Physics.Arcade.Sprite;
        const tier = sprite.getData('tier');
        const challengeId = sprite.getData('challengeId');

        console.log(`Diamond collected! Tier: ${tier}, Challenge: ${challengeId}`);

        // Remove the diamond
        this.diamondSpawner.removeDiamond(sprite);

        // Pause the game
        this.scene.pause();

        // Show a simple message (will be replaced with challenge overlay later)
        const pauseText = this.add.text(960, 540,
            `GAME PAUSED\n\nCollected ${tier.toUpperCase()} Diamond!\nChallenge: ${challengeId}\n\nPress SPACE to resume`,
            {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 20 },
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(5000);

        // Add space key to resume
        const resumeHandler = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                pauseText.destroy();
                this.scene.resume();

                // Add points based on tier (placeholder)
                const points = tier === 'white' ? 1 : tier === 'blue' ? 3 : 10;
                this.score += points;
                this.scoreText.setText(`Score: ${this.score}`);

                window.removeEventListener('keydown', resumeHandler);
            }
        };
        window.addEventListener('keydown', resumeHandler);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
