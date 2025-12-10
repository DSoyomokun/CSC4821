import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    gameOverText : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0x000000);

        // Get actual screen dimensions
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Create full-screen dark overlay
        const overlay = this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.9);
        overlay.setDepth(0);

        // Game Over text - large and centered
        this.gameOverText = this.add.text(centerX, centerY, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: '96px',
            color: '#ff0000',
            stroke: '#ffffff',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add subtitle
        const subtitle = this.add.text(centerX, centerY + 80, '3 Failed Attempts', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }

    changeScene ()
    {
        this.scene.start('MainMenu');
    }
}
