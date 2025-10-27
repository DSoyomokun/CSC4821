import { Scene } from 'phaser';

export type DiamondTier = 'white' | 'blue' | 'black';

/**
 * Diamond - Collectible that triggers coding challenges
 * Spawns at specific distance intervals based on tier
 */
export class Diamond {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private scene: Scene;
    public tier: DiamondTier;
    private scrollSpeed: number;
    private x: number;
    private y: number;
    public challengeId: string;

    // Visual elements
    private rectangle: Phaser.GameObjects.Rectangle;

    constructor(
        scene: Scene,
        x: number,
        groundY: number,
        tier: DiamondTier,
        challengeId: string,
        scrollSpeed: number
    ) {
        this.scene = scene;
        this.tier = tier;
        this.challengeId = challengeId;
        this.scrollSpeed = scrollSpeed;
        this.x = x;

        // Position diamond on the ground
        this.y = groundY - 15; // Half the height of the diamond (30/2)

        // Create simple rectangle sprite for diamond
        const color = this.getTierColor();
        this.rectangle = scene.add.rectangle(this.x, this.y, 30, 30, color);

        // Create invisible physics sprite for collision
        this.sprite = scene.physics.add.sprite(this.x, this.y, '__MISSING');
        this.sprite.setVisible(false);
        this.sprite.setAlpha(0);

        // Configure physics
        if (this.sprite.body) {
            const body = this.sprite.body as Phaser.Physics.Arcade.Body;
            body.setAllowGravity(false);
            body.setImmovable(true);
            body.setSize(30, 30); // Collision box size
            body.setEnable(true); // Explicitly enable collision
            console.log(`Diamond physics body enabled: size=${body.width}x${body.height}`);
        } else {
            console.error('Diamond sprite has no physics body!');
        }

        // Store data on sprite for easy access during collision
        this.sprite.setData('tier', tier);
        this.sprite.setData('challengeId', challengeId);

        console.log(`Created ${tier} diamond at x=${this.x} with challenge ${challengeId}`);
    }

    public update(delta: number): void {
        // Move diamond leftward with scroll speed
        const scrollAmount = this.scrollSpeed * (delta / 1000);
        this.x -= scrollAmount;

        // Update positions (no floating animation)
        this.sprite.setPosition(this.x, this.y);
        this.rectangle.setPosition(this.x, this.y);
    }

    private getTierColor(): number {
        switch (this.tier) {
            case 'white':
                return 0xffffff; // White
            case 'blue':
                return 0x3498db; // Blue
            case 'black':
                return 0x2c3e50; // Dark gray (black would be invisible)
            default:
                return 0xffffff;
        }
    }

    public isOffScreen(): boolean {
        return this.x < -100;
    }

    public setScrollSpeed(speed: number): void {
        this.scrollSpeed = speed;
    }

    public hide(): void {
        this.rectangle.setVisible(false);
    }

    public show(): void {
        this.rectangle.setVisible(true);
    }

    public destroy(): void {
        this.sprite.destroy();
        this.rectangle.destroy();
    }
}
