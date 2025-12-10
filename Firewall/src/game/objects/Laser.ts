import { Scene } from 'phaser';

export type LaserHeight = 'ground' | 'middle' | 'high';

/**
 * Laser - Obstacle that player must jump over or slide under
 * Has a warning phase before becoming active
 */
export class Laser {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public warningSprite: Phaser.GameObjects.Graphics;
    public laserSprite: Phaser.GameObjects.Graphics; // Red laser graphic
    private scene: Scene;
    public height: LaserHeight;
    private scrollSpeed: number;
    private x: number; // Track position manually
    private y: number;

    // Laser states
    private isActive: boolean = false;
    private hasZapped: boolean = false;
    private warningDuration: number = 1000; // 1 second warning
    private zapDuration: number = 1000; // Laser stays active for 1 second then disappears
    private warningTimer: number = 0;
    private zapTimer: number = 0;

    constructor(scene: Scene, x: number, groundY: number, height: LaserHeight, scrollSpeed: number) {
        this.scene = scene;
        this.height = height;
        this.scrollSpeed = scrollSpeed;
        this.x = x;

        // Determine Y position for HORIZONTAL laser beams
        // Lasers extend horizontally across the entire screen
        let laserWidth = 2000; // Wide horizontal beam
        let laserHeight = 20; // Thin horizontal beam

        switch (height) {
            case 'ground':
                // Laser at diamond position (same Y as diamonds spawn), moved up 20 pixels
                this.y = groundY - 35; // 20 pixels higher than diamonds (was groundY - 15)
                break;
            case 'middle':
                // Middle laser - horizontal beam at mid-height
                this.y = groundY - 150;
                break;
            case 'high':
                // High laser - horizontal beam high up, must SLIDE under
                this.y = groundY - 250;
                break;
        }

        // Create warning indicator (hollow yellow rectangle)
        this.warningSprite = scene.add.graphics();
        this.warningSprite.lineStyle(3, 0xffff00, 0.8);
        this.warningSprite.strokeRect(-laserWidth, -laserHeight/2, laserWidth * 2, laserHeight);
        this.warningSprite.setPosition(this.x, this.y);

        // Create red laser graphic (initially not drawn)
        this.laserSprite = scene.add.graphics();
        this.laserSprite.setPosition(this.x, this.y);

        // Create physics sprite for collision (completely invisible)
        this.sprite = scene.physics.add.sprite(this.x, this.y, '__MISSING');
        this.sprite.setVisible(false);
        this.sprite.setAlpha(0);

        // Configure physics - no gravity, immovable
        if (this.sprite.body) {
            const body = this.sprite.body as Phaser.Physics.Arcade.Body;
            body.setAllowGravity(false);
            body.setImmovable(true);
            // Set collision box size to match laser visual (wide horizontal beam)
            body.setSize(laserWidth * 2, laserHeight);
            // Collision box is centered on sprite (origin is center by default)
            // No offset needed - collision box matches visual laser beam
            body.enable = false; // Disable collision during warning
            body.debugShowBody = false; // Don't show debug outline
            // Refresh the body to ensure changes take effect
            body.updateFromGameObject();
            console.log(`Laser collision box: size=${laserWidth * 2}x${laserHeight}, enabled=${body.enable}, position=(${this.x}, ${this.y})`);
        }

        console.log(`Created ${height} laser at x=${this.x}, y=${this.y}`);
    }


    public update(delta: number): void {
        // Move laser leftward
        const scrollAmount = this.scrollSpeed * (delta / 1000);
        this.x -= scrollAmount;

        // Update all visual positions
        this.sprite.x = this.x;
        this.sprite.y = this.y; // Keep Y position synced
        
        // Update physics body position - critical for collision detection
        if (this.sprite.body) {
            const body = this.sprite.body as Phaser.Physics.Arcade.Body;
            // Update body position from sprite
            body.updateFromGameObject();
            // Ensure body is enabled when laser is active
            if (this.isActive && !this.hasZapped) {
                body.enable = true;
            }
        }
        
        this.warningSprite.x = this.x;
        this.warningSprite.y = this.y;
        this.laserSprite.x = this.x;
        this.laserSprite.y = this.y;

        // Handle warning phase
        if (!this.isActive && !this.hasZapped) {
            this.warningTimer += delta;

            // Activate laser after warning duration
            if (this.warningTimer >= this.warningDuration) {
                this.activate();
            }
        }

        // Handle active zap phase
        if (this.isActive && !this.hasZapped) {
            this.zapTimer += delta;

            // Deactivate laser after zap duration
            if (this.zapTimer >= this.zapDuration) {
                this.deactivate();
            }
        }
    }

    private deactivate(): void {
        this.hasZapped = true;
        this.isActive = false;

        // Clear red laser graphic (same as warning)
        this.laserSprite.clear();

        // Disable collision
        if (this.sprite.body) {
            (this.sprite.body as Phaser.Physics.Arcade.Body).enable = false;
        }

        console.log(`Laser deactivated (zapped) at x=${this.x}`);
    }

    private activate(): void {
        this.isActive = true;

        // Hide warning, show red laser
        this.warningSprite.clear();

        // Draw red laser (filled rectangle - different from yellow outline)
        const laserWidth = 2000;
        const laserHeight = 20;
        this.laserSprite.fillStyle(0xff0000, 0.8); // Red, semi-transparent
        this.laserSprite.fillRect(-laserWidth, -laserHeight/2, laserWidth * 2, laserHeight);

        // Enable collision and ensure collision box is properly configured
        if (this.sprite.body) {
            const body = this.sprite.body as Phaser.Physics.Arcade.Body;
            // Ensure collision box is properly sized
            body.setSize(laserWidth * 2, laserHeight);
            // Enable collision detection
            body.enable = true;
            // Don't show debug outline
            body.debugShowBody = false;
            // Refresh the body to ensure changes take effect
            body.updateFromGameObject();
            console.log(`Laser activated at x=${this.x}, y=${this.y}, collision enabled, size=${laserWidth * 2}x${laserHeight}, body.enable=${body.enable}`);
        }

        console.log(`Laser activated at x=${this.x}`);
    }

    public isOffScreen(): boolean {
        return this.x < -100;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public setScrollSpeed(speed: number): void {
        this.scrollSpeed = speed;
    }

    public destroy(): void {
        this.sprite.destroy();
        this.warningSprite.destroy();
        this.laserSprite.destroy();
    }
}
