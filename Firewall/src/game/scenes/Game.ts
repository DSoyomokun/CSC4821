import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { RunnerPlayer } from '../objects/RunnerPlayer';
import { Laser, LaserHeight } from '../objects/Laser';
import { DiamondSpawner } from '../objects/DiamondSpawner';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background!: Phaser.GameObjects.TileSprite;
    player!: RunnerPlayer;
    ground!: Phaser.GameObjects.Rectangle;
    lasers: Laser[] = [];
    diamondSpawner!: DiamondSpawner;

    // Game state
    private scrollSpeed: number = 600; // pixels per second
    private distance: number = 0;
    private readonly GROUND_Y = 900;

    // Laser spawning
    private laserSpawnTimer: number = 0;
    private laserSpawnInterval: number = 120000; // milliseconds

    // UI
    private distanceText!: Phaser.GameObjects.Text;
    private helpText!: Phaser.GameObjects.Text;
    private scoreText!: Phaser.GameObjects.Text;
    private score: number = 0;

    // Collision
    private collisionGroup!: Phaser.Physics.Arcade.Group;
    private laserCollider!: Phaser.Physics.Arcade.Collider;
    private diamondCollider!: Phaser.Physics.Arcade.Collider;
    private isDiamondPaused: boolean = false;
    
    // Pause state
    private isPaused: boolean = false;
    private pauseOverlay!: Phaser.GameObjects.Container;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x0a0a1a);
        this.camera.setZoom(0.5); // Zoom out to show more of the game world
        // Move camera down and to the right to show full game
        this.camera.setScroll(400, 200);

        // Create scrolling tiled background
        this.background = this.add.tileSprite(960, 540, 1920, 1080, 'background');
        this.background.setDepth(-100); // Behind everything

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

        // Setup collisions ONCE (not every frame!)
        this.laserCollider = this.physics.add.overlap(
            this.player.getSprite(),
            this.collisionGroup,
            this.handleLaserCollision,
            undefined,
            this
        );

        this.diamondCollider = this.physics.add.overlap(
            this.player.getSprite(),
            this.diamondSpawner.diamondsGroup,
            this.handleDiamondCollision,
            undefined,
            this
        );

        // Setup UI
        this.setupUI();

        // Reset game state
        this.distance = 0;
        this.score = 0;
        this.laserSpawnTimer = 0;
        this.lasers = [];
        this.isPaused = false;

        // Setup pause functionality
        this.setupPauseControls();

        EventBus.emit('current-scene-ready', this);
    }

    private setupUI(): void {
        this.distanceText = this.add.text(16, 16, 'Distance: 0m', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setDepth(1000);

        // Score counter in top right
        this.scoreText = this.add.text(this.scale.width - 16, 16, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0).setDepth(1000);

        this.helpText = this.add.text(960, 100, 'FIREWALL - Endless Runner\n\nSPACE/W/↑ - Jump\n\nWatch for YELLOW warnings!\nJump over lasers!', {
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
        // Don't update if paused
        if (this.isPaused) {
            return;
        }

        // Scroll the background continuously
        if (this.background) {
            this.background.tilePositionX += (this.scrollSpeed * delta) / 1000;
        }

        // Update player
        this.player.update(delta);

        // Update distance traveled
        this.distance += (this.scrollSpeed * delta) / 1000;
        this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`);
        
        // Update score (based on distance)
        this.score = Math.floor(this.distance);
        this.scoreText.setText(`Score: ${this.score}`);

        // Update laser spawning
        this.updatelaserSpawning(delta);

        // Update lasers
        this.updateLasers(delta);

        // Update diamond spawner
        this.diamondSpawner.update(delta, this.distance);
    }

    private updatelaserSpawning(delta: number): void {
        this.laserSpawnTimer += delta;

        if (this.laserSpawnTimer >= this.laserSpawnInterval) {
            this.spawnLaser();
            this.laserSpawnTimer = 0;

            // Gradually increase difficulty
            if (this.laserSpawnInterval > 1000) {
                this.laserSpawnInterval -= 50; // Spawn more frequently over time
            }
        }
    }

    private spawnLaser(): void {
        // Only spawn ground lasers since sliding is removed
        const height: LaserHeight = 'ground';

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

    private handleLaserCollision(): void {
        console.log('COLLISION DETECTED!');
        // TODO: Trigger QTE system
        // For now, just log and continue
        // In Phase 2, this will pause game and show QTE overlay
    }

    private handleDiamondCollision(_player: any, diamondSprite: any): void {
        // Prevent multiple pause triggers from the same collision
        if (this.isDiamondPaused) {
            return;
        }

        this.isDiamondPaused = true;
        console.log('handleDiamondCollision called!', _player, diamondSprite);

        const sprite = diamondSprite as Phaser.Physics.Arcade.Sprite;
        const tier = sprite.getData('tier');
        const challengeId = sprite.getData('challengeId');

        console.log(`Diamond collected! Tier: ${tier}, Challenge: ${challengeId}`);

        // Remove the diamond
        this.diamondSpawner.removeDiamond(sprite);

        // Pause the game
        this.scene.pause();

        // Load the problem data
        const problem = this.cache.json.get('problem_contains_duplicate');

        // Launch LeetCode Challenge Scene
        this.scene.launch('LeetCodeChallenge', {
            problem: problem,
            distanceTraveled: this.distance
        });

        // Listen for when challenge scene closes to reset pause state
        this.scene.get('LeetCodeChallenge').events.once('shutdown', () => {
            this.isDiamondPaused = false;
        });
    }

    private setupPauseControls(): void {
        // ESC key to pause/unpause
        this.input.keyboard?.on('keydown-ESC', () => {
            if (this.isDiamondPaused) {
                return; // Don't pause if diamond challenge is active
            }
            this.togglePause();
        });
    }

    private togglePause(): void {
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    private pauseGame(): void {
        this.isPaused = true;
        this.physics.pause();
        
        // Create pause overlay
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.pauseOverlay = this.add.container(centerX, centerY);
        this.pauseOverlay.setDepth(10000);

        // Semi-transparent backdrop
        const backdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8);
        backdrop.setOrigin(0.5);
        this.pauseOverlay.add(backdrop);

        // Pause panel
        const panel = this.add.rectangle(0, 0, 400, 300, 0x000000);
        panel.setStrokeStyle(3, 0x00ff00);
        this.pauseOverlay.add(panel);

        // Pause title
        const title = this.add.text(0, -80, '> PAUSED', {
            fontSize: '36px',
            color: '#00ff00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold',
            stroke: '#00ff00',
            strokeThickness: 1
        });
        title.setOrigin(0.5);
        this.pauseOverlay.add(title);

        // Resume button
        const resumeBtn = this.add.text(0, 20, '> RESUME (ESC)', {
            fontSize: '20px',
            color: '#00ff00',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold',
            stroke: '#00ff00',
            strokeThickness: 0.5
        });
        resumeBtn.setOrigin(0.5);
        resumeBtn.setInteractive({ useHandCursor: true });
        resumeBtn.on('pointerdown', () => this.resumeGame());
        resumeBtn.on('pointerover', () => {
            resumeBtn.setStyle({ strokeThickness: 1 });
        });
        resumeBtn.on('pointerout', () => {
            resumeBtn.setStyle({ strokeThickness: 0.5 });
        });
        this.pauseOverlay.add(resumeBtn);

        // Quit button
        const quitBtn = this.add.text(0, 70, '> QUIT TO MENU', {
            fontSize: '18px',
            color: '#ff0000',
            fontFamily: 'Courier New, monospace',
            fontStyle: 'bold',
            stroke: '#ff0000',
            strokeThickness: 0.5
        });
        quitBtn.setOrigin(0.5);
        quitBtn.setInteractive({ useHandCursor: true });
        quitBtn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
        quitBtn.on('pointerover', () => {
            quitBtn.setStyle({ strokeThickness: 1 });
        });
        quitBtn.on('pointerout', () => {
            quitBtn.setStyle({ strokeThickness: 0.5 });
        });
        this.pauseOverlay.add(quitBtn);
    }

    private resumeGame(): void {
        this.isPaused = false;
        this.physics.resume();
        
        // Remove pause overlay
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null as any;
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
