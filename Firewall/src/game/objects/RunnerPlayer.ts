import { Scene } from 'phaser';

/**
 * RunnerPlayer - Player character for endless runner with jump mechanics
 */
export class RunnerPlayer {
    private scene: Scene;
    public sprite: Phaser.Physics.Arcade.Sprite;
    private readonly JUMP_VELOCITY = -650;
    private readonly PLAYER_X = 300; // Fixed X position on screen

    // Input
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private spaceKey: Phaser.Input.Keyboard.Key | undefined;
    private wKey: Phaser.Input.Keyboard.Key | undefined;

    constructor(scene: Scene, groundY: number) {
        this.scene = scene;

        // Create player sprite with physics - using running animation
        this.sprite = scene.physics.add.sprite(this.PLAYER_X, groundY - 15, 'player-run');
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
        }
    }

    public update(delta: number): void {
        // Handle input
        this.handleInput();

        // Keep player at fixed X position
        this.sprite.x = this.PLAYER_X;
    }

    private handleInput(): void {
        if (!this.cursors && !this.spaceKey) return;

        // Jump input (only when on ground)
        const jumpPressed =
            Phaser.Input.Keyboard.JustDown(this.spaceKey!) ||
            Phaser.Input.Keyboard.JustDown(this.cursors!.up) ||
            Phaser.Input.Keyboard.JustDown(this.wKey!);

        if (jumpPressed && this.sprite.body && this.isOnGround()) {
            this.jump();
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

    private isOnGround(): boolean {
        if (!this.sprite.body) return false;
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        return body.touching.down || body.blocked.down;
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public destroy(): void {
        this.sprite.destroy();
    }
}
