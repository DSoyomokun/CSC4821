import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        // Set base URL - works for root domain (Netlify/Vercel) and subpaths (GitHub Pages)
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const baseURL = pathParts.length > 0 && pathParts[0] === 'CSC4821' 
            ? '/CSC4821/' 
            : '/';
        
        this.load.setBaseURL(baseURL);
        
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');
        this.load.image('diamond', 'diamondyahoo.png');

        // Load player running sprite sheet (28 frames, 4x7 grid)
        this.load.spritesheet('player-run', 'player-run.png', {
            frameWidth: 768,
            frameHeight: 448
        });

        // Load player slide sprite sheet (29 frames, 8 rows x 4 columns)
        // Note: Update frameWidth and frameHeight based on actual sprite sheet dimensions
        this.load.spritesheet('player-slide', 'spriteslide.png', {
            frameWidth: 768,  // Update with actual frame width if different
            frameHeight: 448  // Update with actual frame height if different
        });

        //  Load game data
        this.load.setPath('data');
        this.load.json('spawn_patterns', 'spawn_patterns.json');
        this.load.json('challenges', 'challenges.json');

        // Load LeetCode problems
        this.load.setPath('data/problems');
        this.load.json('problem_contains_duplicate', 'contains_duplicate.json');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        // Create player running animation
        this.anims.create({
            key: 'player-run',
            frames: this.anims.generateFrameNumbers('player-run', {
                start: 0,
                end: 27  // 28 frames (0-27)
            }),
            frameRate: 24,  // Adjust for animation speed
            repeat: -1      // Loop forever
        });

        // Create player slide animation (29 frames: 0-28)
        // Note: repeat: 0 means play once (no loop)
        this.anims.create({
            key: 'player-slide',
            frames: this.anims.generateFrameNumbers('player-slide', {
                start: 0,
                end: 28  // 29 frames total (0-28)
            }),
            frameRate: 24,  // Adjust for animation speed (same as run animation)
            repeat: 0       // Play once, don't loop (animationcomplete event will handle transition)
        });

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
