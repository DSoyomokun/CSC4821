import { Scene } from 'phaser';
import { SoftPlatform } from './SoftPlatform';
import { DiamondTier } from './Diamond';

interface PlatformSpawnConfig {
    distance: number; // Distance at which to spawn
    y: number; // Y position (height above ground)
    width: number; // Platform width
    hasDiamond?: boolean; // Whether platform has a diamond
    diamondTier?: DiamondTier; // Diamond tier if platform has diamond
    challengeId?: string; // Challenge ID if platform has diamond
}

/**
 * SoftPlatformSpawner - Manages spawning soft platforms
 */
export class SoftPlatformSpawner {
    private scene: Scene;
    private platforms: SoftPlatform[] = [];
    public platformsGroup: Phaser.Physics.Arcade.Group;
    private scrollSpeed: number;
    private groundY: number;
    private lastSpawnDistance: number = 0;
    private spawnConfigs: PlatformSpawnConfig[] = [];
    private nextSpawnIndex: number = 0;

    // Spawn parameters
    private readonly MIN_SPAWN_INTERVAL = 500; // Minimum distance between platforms
    private readonly MAX_SPAWN_INTERVAL = 1500; // Maximum distance between platforms
    private readonly PLATFORM_WIDTH_MIN = 150;
    private readonly PLATFORM_WIDTH_MAX = 300;
    private readonly PLATFORM_HEIGHT_MIN = 200; // Min height above ground
    private readonly PLATFORM_HEIGHT_MAX = 400; // Max height above ground

    constructor(scene: Scene, groundY: number, scrollSpeed: number) {
        this.scene = scene;
        this.groundY = groundY;
        this.scrollSpeed = scrollSpeed;

        // Create physics group for platform collision detection
        this.platformsGroup = scene.physics.add.group();

        // Generate initial spawn configs
        this.generateSpawnConfigs();
    }

    private generateSpawnConfigs(): void {
        // Generate platforms at regular intervals
        let currentDistance = 1000; // Start spawning after 1000m
        const numPlatforms = 20; // Generate 20 platforms ahead

        for (let i = 0; i < numPlatforms; i++) {
            const width = Phaser.Math.Between(
                this.PLATFORM_WIDTH_MIN,
                this.PLATFORM_WIDTH_MAX
            );
            const height = Phaser.Math.Between(
                this.PLATFORM_HEIGHT_MIN,
                this.PLATFORM_HEIGHT_MAX
            );

            // 30% chance of platform having a diamond
            const hasDiamond = Phaser.Math.Between(1, 100) <= 30;
            let diamondTier: DiamondTier | undefined;
            let challengeId: string | undefined;

            if (hasDiamond) {
                // Randomly assign diamond tier (weighted towards white)
                const tierRoll = Phaser.Math.Between(1, 100);
                if (tierRoll <= 70) {
                    diamondTier = 'white';
                } else if (tierRoll <= 90) {
                    diamondTier = 'blue';
                } else {
                    diamondTier = 'black';
                }
                challengeId = 'contains_duplicate'; // Default challenge, can be expanded later
            }

            this.spawnConfigs.push({
                distance: currentDistance,
                y: this.groundY - height,
                width: width,
                hasDiamond: hasDiamond,
                diamondTier: diamondTier,
                challengeId: challengeId
            });

            // Next platform spawns at random interval
            currentDistance += Phaser.Math.Between(
                this.MIN_SPAWN_INTERVAL,
                this.MAX_SPAWN_INTERVAL
            );
        }
    }

    public update(delta: number, currentDistance: number): void {
        // Check if we should spawn a new platform
        if (this.nextSpawnIndex < this.spawnConfigs.length) {
            const nextConfig = this.spawnConfigs[this.nextSpawnIndex];

            if (currentDistance >= nextConfig.distance && 
                this.lastSpawnDistance < nextConfig.distance) {
                this.spawnPlatform(nextConfig);
                this.lastSpawnDistance = nextConfig.distance;
                this.nextSpawnIndex++;

                // Generate more configs if we're running low
                if (this.nextSpawnIndex >= this.spawnConfigs.length - 5) {
                    this.generateMoreConfigs(currentDistance);
                }
            }
        }

        // Update all platforms and remove off-screen ones
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            const platform = this.platforms[i];
            platform.update(delta);

            if (platform.isOffScreen()) {
                this.platformsGroup.remove(platform.sprite);
                platform.destroy();
                this.platforms.splice(i, 1);
            }
        }
    }

    private generateMoreConfigs(startDistance: number): void {
        let currentDistance = startDistance + this.MIN_SPAWN_INTERVAL;
        const numPlatforms = 10;

        for (let i = 0; i < numPlatforms; i++) {
            const width = Phaser.Math.Between(
                this.PLATFORM_WIDTH_MIN,
                this.PLATFORM_WIDTH_MAX
            );
            const height = Phaser.Math.Between(
                this.PLATFORM_HEIGHT_MIN,
                this.PLATFORM_HEIGHT_MAX
            );

            // 30% chance of platform having a diamond
            const hasDiamond = Phaser.Math.Between(1, 100) <= 30;
            let diamondTier: DiamondTier | undefined;
            let challengeId: string | undefined;

            if (hasDiamond) {
                const tierRoll = Phaser.Math.Between(1, 100);
                if (tierRoll <= 70) {
                    diamondTier = 'white';
                } else if (tierRoll <= 90) {
                    diamondTier = 'blue';
                } else {
                    diamondTier = 'black';
                }
                challengeId = 'contains_duplicate';
            }

            this.spawnConfigs.push({
                distance: currentDistance,
                y: this.groundY - height,
                width: width,
                hasDiamond: hasDiamond,
                diamondTier: diamondTier,
                challengeId: challengeId
            });

            currentDistance += Phaser.Math.Between(
                this.MIN_SPAWN_INTERVAL,
                this.MAX_SPAWN_INTERVAL
            );
        }
    }

    private spawnPlatform(config: PlatformSpawnConfig): void {
        const x = 2000; // Spawn off-screen to the right

        const platform = new SoftPlatform(
            this.scene,
            x,
            config.y,
            config.width,
            this.scrollSpeed,
            config.diamondTier,
            config.challengeId
        );

        this.platforms.push(platform);
        this.platformsGroup.add(platform.sprite);

        // Diamond will be added to collision group in Game scene

        console.log(`Spawned platform at y=${config.y}, width=${config.width}${config.hasDiamond ? ' with diamond' : ''}`);
    }

    public setScrollSpeed(speed: number): void {
        this.scrollSpeed = speed;
        this.platforms.forEach(platform => platform.setScrollSpeed(speed));
    }

    public removePlatform(sprite: Phaser.Physics.Arcade.Sprite): void {
        const platform = this.platforms.find(p => p.sprite === sprite);
        if (platform) {
            this.platformsGroup.remove(sprite);
            const index = this.platforms.indexOf(platform);
            if (index > -1) {
                this.platforms.splice(index, 1);
            }
            platform.destroy();
        }
    }
    
    public getPlatforms(): SoftPlatform[] {
        return this.platforms;
    }
}

