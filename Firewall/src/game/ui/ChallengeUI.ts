import { Scene } from 'phaser';
import { Challenge } from '../systems/ChallengeManager';

export interface ChallengeUICallbacks {
    onSubmit: (code: string) => void;
    onForfeit: () => void;
}

/**
 * ChallengeUI - Renders the coding challenge interface
 */
export class ChallengeUI {
    private scene: Scene;
    private container: Phaser.GameObjects.Container;
    private callbacks: ChallengeUICallbacks;
    private textArea: HTMLTextAreaElement | null = null;

    // UI elements
    private panel!: Phaser.GameObjects.Rectangle;
    private titleText!: Phaser.GameObjects.Text;
    private descriptionText!: Phaser.GameObjects.Text;
    private exampleText!: Phaser.GameObjects.Text;
    private codeLabel!: Phaser.GameObjects.Text;
    private resultText!: Phaser.GameObjects.Text;
    private submitButton!: Phaser.GameObjects.Container;
    private forfeitButton!: Phaser.GameObjects.Container;

    constructor(scene: Scene, callbacks: ChallengeUICallbacks) {
        this.scene = scene;
        this.callbacks = callbacks;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(2000);
    }

    public show(challenge: Challenge): void {
        // Clear previous UI
        this.container.removeAll(true);
        this.removeTextArea();

        const centerX = this.scene.cameras.main.width / 2;
        const centerY = this.scene.cameras.main.height / 2;

        // Create panel background
        this.panel = this.scene.add.rectangle(0, 0, 800, 600, 0x1a1a2e, 0.95);
        this.panel.setStrokeStyle(4, 0x3498db);

        // Title
        this.titleText = this.scene.add.text(0, -250, challenge.title, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Tier badge
        const tierColor = this.getTierColor(challenge.tier);
        const tierBadge = this.scene.add.rectangle(350, -250, 120, 40, tierColor, 0.8);
        const tierText = this.scene.add.text(350, -250, challenge.tier.toUpperCase(), {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Description
        this.descriptionText = this.scene.add.text(0, -200, challenge.description, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: 750 },
            align: 'center'
        }).setOrigin(0.5);

        // Example
        this.exampleText = this.scene.add.text(0, -130, `Example: ${challenge.example}`, {
            fontFamily: 'Courier New',
            fontSize: '16px',
            color: '#2ecc71',
            wordWrap: { width: 750 },
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);

        // Code input label
        this.codeLabel = this.scene.add.text(0, -60, 'Your Python Code:', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Result text (initially hidden)
        this.resultText = this.scene.add.text(0, 150, '', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            wordWrap: { width: 750 },
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5);
        this.resultText.setVisible(false);

        // Create Submit button
        this.submitButton = this.createButton(-150, 220, 'Submit', 0x2ecc71, () => {
            const code = this.textArea?.value || '';
            this.callbacks.onSubmit(code);
        });

        // Create Forfeit button
        this.forfeitButton = this.createButton(150, 220, 'Forfeit', 0xe74c3c, () => {
            this.callbacks.onForfeit();
        });

        // Add all to container
        this.container.add([
            this.panel,
            this.titleText,
            tierBadge,
            tierText,
            this.descriptionText,
            this.exampleText,
            this.codeLabel,
            this.resultText,
            this.submitButton,
            this.forfeitButton
        ]);

        // Position container at center
        this.container.setPosition(centerX, centerY);

        // Create HTML textarea for code input
        this.createTextArea(centerX, centerY + 50, challenge.functionName);
    }

    private createTextArea(x: number, y: number, functionName: string): void {
        this.textArea = document.createElement('textarea');
        this.textArea.style.position = 'absolute';
        this.textArea.style.left = `${x - 350}px`;
        this.textArea.style.top = `${y}px`;
        this.textArea.style.width = '700px';
        this.textArea.style.height = '150px';
        this.textArea.style.fontFamily = 'Courier New, monospace';
        this.textArea.style.fontSize = '14px';
        this.textArea.style.backgroundColor = '#1a1a1a';
        this.textArea.style.color = '#ffffff';
        this.textArea.style.border = '2px solid #3498db';
        this.textArea.style.padding = '10px';
        this.textArea.style.resize = 'none';
        this.textArea.style.zIndex = '3000';
        this.textArea.placeholder = `def ${functionName}(...):\n    # Write your code here\n    pass`;

        document.body.appendChild(this.textArea);
        this.textArea.focus();
    }

    private removeTextArea(): void {
        if (this.textArea && this.textArea.parentNode) {
            this.textArea.parentNode.removeChild(this.textArea);
            this.textArea = null;
        }
    }

    private createButton(
        x: number,
        y: number,
        text: string,
        color: number,
        callback: () => void
    ): Phaser.GameObjects.Container {
        const buttonContainer = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, 200, 50, color, 1);
        bg.setInteractive({ useHandCursor: true });

        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        buttonContainer.add([bg, label]);

        // Button interactions
        bg.on('pointerover', () => {
            bg.setFillStyle(color, 0.8);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color, 1);
        });

        bg.on('pointerdown', callback);

        return buttonContainer;
    }

    private getTierColor(tier: string): number {
        switch (tier) {
            case 'white':
                return 0xffffff;
            case 'blue':
                return 0x3498db;
            case 'black':
                return 0x2c3e50;
            default:
                return 0xffffff;
        }
    }

    public showResult(success: boolean, message: string): void {
        this.resultText.setVisible(true);

        if (success) {
            this.resultText.setColor('#2ecc71');
            this.resultText.setText(`✓ Success!\n${message}`);
        } else {
            this.resultText.setColor('#e74c3c');
            this.resultText.setText(`✗ Failed\n${message}`);
        }
    }

    public hide(): void {
        this.container.setVisible(false);
        this.removeTextArea();
    }

    public destroy(): void {
        this.removeTextArea();
        this.container.destroy();
    }
}
