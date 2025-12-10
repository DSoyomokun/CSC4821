import { Scene } from 'phaser';
import { Diamond, DiamondTier } from './Diamond';

/**
 * SoftPlatform - Platform that player can jump onto and drop through
 * Player can drop through by holding DOWN/S for 0.75 seconds
 */
export class SoftPlatform {
    public sprite: Phaser.Physics.Arcade.Sprite;
    private scene: Scene;
    private scrollSpeed: number;
    private x: number;
    private y: number;
    private width: number;
    private height: number = 20; // Platform thickness
    private visualOffsetY: number = 0; // Offset to move visual up/down while keeping collision box in place (0 = aligned)

    // Visual element
    private visualRect: Phaser.GameObjects.Rectangle;
    
    // Optional diamond on platform
    public diamond: Diamond | null = null;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        width: number,
        scrollSpeed: number,
        diamondTier?: DiamondTier,
        challengeId?: string
    ) {
        this.scene = scene;
        this.scrollSpeed = scrollSpeed;
        this.x = x;
        this.y = y;
        this.width = width;

        // Create visual platform (semi-transparent green to match matrix theme)
        // Set origin to bottom center to match collision box
        // Apply visual offset immediately
        this.visualRect = scene.add.rectangle(x, y + this.visualOffsetY, width, this.height, 0x00ff00, 0.5);
        this.visualRect.setOrigin(0.5, 1); // Bottom center origin to match collision box
        this.visualRect.setStrokeStyle(2, 0x00ff00);
        this.visualRect.setDepth(10);

        // Create physics body for platform
        // Set origin to bottom center (0.5, 1) so collision box aligns with bottom edge
        const physicsRect = scene.add.rectangle(x, y, width, this.height);
        physicsRect.setVisible(false);
        physicsRect.setOrigin(0.5, 1); // Bottom center origin - bottom edge at y
        scene.physics.add.existing(physicsRect, false); // false = dynamic body

        this.sprite = physicsRect as unknown as Phaser.Physics.Arcade.Sprite;

        // Configure physics - dynamic but immovable platform
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);
        body.setAllowGravity(false); // Don't fall
        body.setSize(width, this.height);
        // Collision box is now aligned with bottom of sprite (at y position)
        
        // Store reference to platform for drop-through logic
        this.sprite.setData('isSoftPlatform', true);
        
        // Spawn diamond on platform if provided
        if (diamondTier && challengeId) {
            // Position diamond on top center of platform
            const diamondY = y - this.height / 2 - 15; // 15 pixels above platform top
            this.diamond = new Diamond(
                scene,
                x, // Same X as platform
                diamondY + 15, // Pass groundY equivalent (diamond expects groundY)
                diamondTier,
                challengeId,
                scrollSpeed
            );
            // Override diamond's internal position tracking
            (this.diamond as any).x = x;
            (this.diamond as any).y = diamondY;
            // Update diamond sprite and image positions
            this.diamond.sprite.x = x;
            this.diamond.sprite.y = diamondY;
            this.diamond.update(0); // Sync the image position
        }
    }

    public update(delta: number): void {
        // Move platform leftward with scroll speed
        const scrollAmount = this.scrollSpeed * (delta / 1000);
        this.x -= scrollAmount;

        // Update positions - use velocity for physics body
        if (this.sprite.body) {
            const body = this.sprite.body as Phaser.Physics.Arcade.Body;
            body.setVelocityX(-this.scrollSpeed);
            body.setVelocityY(0);
            // Update sprite position (collision box follows sprite)
            this.sprite.x = this.x;
            this.sprite.y = this.y; // Bottom edge of collision box is at y
        }
        
        // Update visual position (can be offset from collision box if needed)
        // visualOffsetY allows moving visual up/down while collision box stays at y
        this.visualRect.setPosition(this.x, this.y + this.visualOffsetY);
        
        // Update diamond position if it exists (it will move with platform)
        if (this.diamond) {
            const diamondY = this.y - this.height / 2 - 15;
            // Update diamond's internal position tracking
            (this.diamond as any).x = this.x;
            (this.diamond as any).y = diamondY;
            this.diamond.update(delta);
        }
    }

    public isOffScreen(): boolean {
        return this.x < -200; // Remove when off-screen
    }

    public setScrollSpeed(speed: number): void {
        this.scrollSpeed = speed;
    }
    
    /**
     * Set visual offset to move the sprite up/down while keeping collision box in place
     * Negative values move visual up, positive values move it down
     */
    public setVisualOffsetY(offset: number): void {
        this.visualOffsetY = offset;
    }

    public destroy(): void {
        if (this.diamond) {
            this.diamond.destroy();
        }
        this.sprite.destroy();
        this.visualRect.destroy();
    }
}

