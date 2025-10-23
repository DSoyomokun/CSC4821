import { Scene } from 'phaser';
import { Diamond, DiamondTier } from './Diamond';

interface DiamondSpawnPattern {
    distance: number;
    tier: DiamondTier;
    challengeId: string;
}

interface SpawnPatternData {
    diamondSpawns: DiamondSpawnPattern[];
}

/**
 * DiamondSpawner - Manages spawning diamonds at specific distance milestones
 */
export class DiamondSpawner {
    private scene: Scene;
    private diamonds: Diamond[] = [];
    private spawnPatterns: DiamondSpawnPattern[] = [];
    private nextSpawnIndex: number = 0;
    public diamondsGroup: Phaser.Physics.Arcade.Group;
    private scrollSpeed: number;
    private groundY: number;

    constructor(scene: Scene, groundY: number, scrollSpeed: number) {
        this.scene = scene;
        this.groundY = groundY;
        this.scrollSpeed = scrollSpeed;

        // Create physics group for diamond collision detection
        this.diamondsGroup = scene.physics.add.group();

        // Load spawn patterns
        this.loadSpawnPatterns();
    }

    private loadSpawnPatterns(): void {
        // Load spawn patterns from JSON file
        const data = this.scene.cache.json.get('spawn_patterns') as SpawnPatternData;

        if (data && data.diamondSpawns) {
            this.spawnPatterns = data.diamondSpawns;
            console.log(`Loaded ${this.spawnPatterns.length} diamond spawn patterns`);
        } else {
            console.error('Failed to load spawn patterns');
        }
    }

    public update(delta: number, currentDistance: number): void {
        // Check if we should spawn next diamond
        if (this.nextSpawnIndex < this.spawnPatterns.length) {
            const nextSpawn = this.spawnPatterns[this.nextSpawnIndex];

            // Spawn when player reaches the distance milestone
            if (currentDistance >= nextSpawn.distance) {
                this.spawnDiamond(nextSpawn.tier, nextSpawn.challengeId);
                this.nextSpawnIndex++;
            }
        }

        // Update all active diamonds
        for (let i = this.diamonds.length - 1; i >= 0; i--) {
            const diamond = this.diamonds[i];
            diamond.update(delta);

            // Clean up off-screen diamonds
            if (diamond.isOffScreen()) {
                this.diamondsGroup.remove(diamond.sprite);
                diamond.destroy();
                this.diamonds.splice(i, 1);
            }
        }
    }

    private spawnDiamond(tier: DiamondTier, challengeId: string): void {
        const x = 2000; // Spawn off-screen to the right

        const diamond = new Diamond(
            this.scene,
            x,
            this.groundY,
            tier,
            challengeId,
            this.scrollSpeed
        );

        this.diamonds.push(diamond);
        this.diamondsGroup.add(diamond.sprite);

        console.log(`Spawned ${tier} diamond with challenge ${challengeId} at x=${x}`);
    }

    public setScrollSpeed(speed: number): void {
        this.scrollSpeed = speed;

        // Update scroll speed for all active diamonds
        for (const diamond of this.diamonds) {
            diamond.setScrollSpeed(speed);
        }
    }

    public removeDiamond(sprite: Phaser.Physics.Arcade.Sprite): void {
        // Find and remove the diamond with this sprite
        for (let i = this.diamonds.length - 1; i >= 0; i--) {
            if (this.diamonds[i].sprite === sprite) {
                const diamond = this.diamonds[i];
                this.diamondsGroup.remove(diamond.sprite);
                diamond.destroy();
                this.diamonds.splice(i, 1);
                console.log('Removed collected diamond');
                break;
            }
        }
    }

    public hideDiamond(sprite: Phaser.Physics.Arcade.Sprite): void {
        // Find and hide the diamond temporarily (for challenge overlay)
        for (const diamond of this.diamonds) {
            if (diamond.sprite === sprite) {
                diamond.hide();
                console.log('Hidden diamond during challenge');
                break;
            }
        }
    }

    public showDiamond(sprite: Phaser.Physics.Arcade.Sprite): void {
        // Find and show the diamond again
        for (const diamond of this.diamonds) {
            if (diamond.sprite === sprite) {
                diamond.show();
                console.log('Shown diamond after challenge');
                break;
            }
        }
    }

    public destroy(): void {
        // Clean up all diamonds
        for (const diamond of this.diamonds) {
            diamond.destroy();
        }
        this.diamonds = [];
        this.diamondsGroup.clear(true, true);
    }
}
