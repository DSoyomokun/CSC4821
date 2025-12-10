import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.TileSprite;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    private scrollSpeed: number = 50; // pixels per second

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { width, height } = this.scale;
        
        // Create tiling background that scrolls continuously - fill entire screen
        this.background = this.add.tileSprite(width / 2, height / 2, width, height, 'background');

        this.logo = this.add.image(width / 2, height / 2 - 100, 'logo').setDepth(100);

        this.title = this.add.text(width / 2, height / 2 + 100, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add instruction text
        const instructionText = this.add.text(width / 2, height / 2 + 200, 'Press SPACE or Click to Start', {
            fontFamily: 'Arial', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Make instruction text blink
        this.tweens.add({
            targets: instructionText,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Add keyboard input
        this.input.keyboard?.on('keydown-SPACE', () => {
            this.changeScene();
        });

        this.input.keyboard?.on('keydown-ENTER', () => {
            this.changeScene();
        });

        // Add mouse/touch input
        this.input.once('pointerdown', () => {
            this.changeScene();
        });

        // Make the scene interactive
        this.input.setDefaultCursor('pointer');

        EventBus.emit('current-scene-ready', this);
    }

    update(_time: number, delta: number): void {
        // Scroll the background continuously
        if (this.background) {
            this.background.tilePositionX += (this.scrollSpeed * delta) / 1000;
        }
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (vueCallback: ({ x, y }: { x: number, y: number }) => void)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback)
                    {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}
