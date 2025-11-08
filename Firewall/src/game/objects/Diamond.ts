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

        // Create invisible rectangle for physics (using static body to avoid gravity)
        const physicsRect = scene.add.rectangle(this.x, this.y, 30, 30);
        physicsRect.setVisible(false);
        scene.physics.add.existing(physicsRect, false); // false = dynamic body

        this.sprite = physicsRect as unknown as Phaser.Physics.Arcade.Sprite;

        // Configure physics - disable gravity completely
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setImmovable(true);
        body.setSize(30, 30);
        body.offset.y = -30; // Adjust offset since origin is center by default

        console.log(`Diamond physics body: gravity=${body.allowGravity}, size=${body.width}x${body.height}, position=${body.x},${body.y}`);

        // Store data on sprite for easy access during collision
        this.sprite.setData('tier', tier);
        this.sprite.setData('challengeId', challengeId);

        console.log(`Created ${tier} diamond at x=${this.x} with challenge ${challengeId}`);
    }

    public update(delta: number): void {
        // Move diamond leftward with scroll speed
        const scrollAmount = this.scrollSpeed * (delta / 1000);
        this.x -= scrollAmount;

        // Update positions manually (physics body won't fall if gravity is disabled)
        this.sprite.x = this.x;
        this.sprite.y = this.y;

        // Also force velocity to 0 to prevent any drift
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.velocity.x = 0;
        body.velocity.y = 0;

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
