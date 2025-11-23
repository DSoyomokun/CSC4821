import { Scene } from 'phaser';

/**
 * RunnerPlayer - Player character for endless runner with jump and slide mechanics
 */
export class RunnerPlayer {
    private scene: Scene;
    public sprite: Phaser.Physics.Arcade.Sprite;
    private isSliding: boolean = false;
    private slideTimer: number = 0;
    private readonly SLIDE_DURATION = 600; // milliseconds
    private readonly JUMP_VELOCITY = -650;
    private readonly PLAYER_X = 300; // Fixed X position on screen

    // Input
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private spaceKey: Phaser.Input.Keyboard.Key | undefined;
    private wKey: Phaser.Input.Keyboard.Key | undefined;
    private sKey: Phaser.Input.Keyboard.Key | undefined;
    private shiftKey: Phaser.Input.Keyboard.Key | undefined;

    constructor(scene: Scene, groundY: number) {
        this.scene = scene;

        // Create placeholder graphics for sliding
        const graphics = scene.add.graphics();

        // Sliding sprite (60x30 - wider and shorter)
        graphics.fillStyle(0x3498db, 1);
        graphics.fillRect(0, 0, 60, 30);
        graphics.generateTexture('player-sliding', 60, 30);
        graphics.destroy();

        // Create player sprite with physics - using running animation
        this.sprite = scene.physics.add.sprite(this.PLAYER_X, groundY - 30, 'player-run');
        this.sprite.setOrigin(0.5, 1); // Bottom center origin

        // Scale down the huge sprite to reasonable size (768x448 -> ~77x45)
        this.sprite.setScale(0.9);

        this.sprite.setCollideWorldBounds(false);
        this.sprite.setBounce(0);
        this.sprite.setGravityY(0); // Using scene gravity instead

        // Set body size after scaling
        if (this.sprite.body) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(40, 60);
        }

        // Play running animation
        this.sprite.play('player-run');

        // Setup input
        this.setupInput();
    }

    private setupInput(): void {
        if (this.scene.input.keyboard) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.wKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.sKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            this.shiftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        }
    }

    public update(delta: number): void {
        // Handle slide timer
        if (this.isSliding) {
            this.slideTimer -= delta;
            if (this.slideTimer <= 0) {
                this.endSlide();
            }
        }

        // Handle input
        this.handleInput();

        // Keep player at fixed X position
        this.sprite.x = this.PLAYER_X;
    }

    private handleInput(): void {
        if (!this.cursors && !this.spaceKey) return;

        // Jump input (only when on ground and not sliding)
        const jumpPressed =
            Phaser.Input.Keyboard.JustDown(this.spaceKey!) ||
            Phaser.Input.Keyboard.JustDown(this.cursors!.up) ||
            Phaser.Input.Keyboard.JustDown(this.wKey!);

        if (jumpPressed && this.sprite.body && this.isOnGround() && !this.isSliding) {
            this.jump();
        }

        // Slide input (only when on ground and not already sliding)
        const slidePressed =
            Phaser.Input.Keyboard.JustDown(this.cursors!.down) ||
            Phaser.Input.Keyboard.JustDown(this.sKey!) ||
            Phaser.Input.Keyboard.JustDown(this.shiftKey!);

        if (slidePressed && this.isOnGround() && !this.isSliding) {
            this.slide();
        }
    }

    private jump(): void {
        if (this.sprite.body) {
            this.sprite.setVelocityY(this.JUMP_VELOCITY);
            console.log('Player jumped!');
            // TODO: Play jump animation
            // TODO: Play jump sound effect
        }
    }

    private slide(): void {
        this.isSliding = true;
        this.slideTimer = this.SLIDE_DURATION;

        // Stop running animation and switch to sliding sprite
        this.sprite.stop();
        this.sprite.setTexture('player-sliding');
        this.sprite.setScale(1); // Reset scale for sliding sprite
        if (this.sprite.body) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(60, 30);
        }

        console.log('Player sliding!');
        // TODO: Play slide animation
        // TODO: Play slide sound effect
    }

    private endSlide(): void {
        this.isSliding = false;

        // Switch back to running animation and restore hitbox
        this.sprite.play('player-run');
        this.sprite.setScale(0.1); // Restore scale for running animation
        if (this.sprite.body) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).setSize(40, 60);
        }

        console.log('Slide ended');
    }

    private isOnGround(): boolean {
        if (!this.sprite.body) return false;
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        return body.touching.down || body.blocked.down;
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public isPlayerSliding(): boolean {
        return this.isSliding;
    }

    public destroy(): void {
        this.sprite.destroy();
    }
}
