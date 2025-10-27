# Blind 75 Implementation for Phaser 3 Side-Scroller

## Overview
This document details the implementation of all 75 Blind 75 LeetCode problems in sequential order (easiest to hardest) in your Phaser 3 side-scroller game. Diamonds spawn every 3000 meters after completing each problem, ensuring players progress through problems in the correct learning order.

## Core Concepts

### Problem Progression System
- **Sequential Order**: Problems are presented from easiest to hardest
- **No Skipping**: Must complete current problem to unlock next
- **3000m Spacing**: After solving a problem, next diamond appears 3000 meters later
- **One Diamond at a Time**: Only one diamond/problem exists at any moment

## Implementation Architecture

### 1. Blind 75 Manager

Manages the queue of problems and tracks progression through all 75 problems.

```typescript
// systems/Blind75Manager.ts
import { LeetCodeProblem } from '../types/LeetCodeTypes';

export class Blind75Manager {
    private problemQueue: LeetCodeProblem[];
    private currentProblemIndex: number = 0;
    private completedProblems: Set<string> = new Set();
    private savedSolutions: Map<string, string> = new Map();
    
    constructor(scene: Phaser.Scene) {
        this.loadProblems(scene);
        this.loadProgress();
    }
    
    private loadProblems(scene: Phaser.Scene) {
        // Load the ordered list of Blind 75 problems
        const problemData = scene.cache.json.get('blind75_ordered');
        this.problemQueue = problemData.problems;
    }
    
    private loadProgress() {
        // Load saved progress from localStorage
        const saved = localStorage.getItem('blind75_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentProblemIndex = data.currentIndex || 0;
            this.completedProblems = new Set(data.completed || []);
            this.savedSolutions = new Map(data.solutions || []);
        }
    }
    
    getCurrentProblem(): LeetCodeProblem {
        if (this.currentProblemIndex < this.problemQueue.length) {
            return this.problemQueue[this.currentProblemIndex];
        }
        return null; // All problems completed!
    }
    
    getNextProblem(): LeetCodeProblem | null {
        if (this.currentProblemIndex + 1 < this.problemQueue.length) {
            return this.problemQueue[this.currentProblemIndex + 1];
        }
        return null;
    }
    
    markCurrentProblemComplete(solution: string) {
        const problem = this.getCurrentProblem();
        if (problem) {
            this.completedProblems.add(problem.id);
            this.savedSolutions.set(problem.id, solution);
            this.currentProblemIndex++;
            this.saveProgress();
        }
    }
    
    private saveProgress() {
        const data = {
            currentIndex: this.currentProblemIndex,
            completed: Array.from(this.completedProblems),
            solutions: Array.from(this.savedSolutions.entries()),
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('blind75_progress', JSON.stringify(data));
    }
    
    getProgress(): { current: number, total: number, percentage: number } {
        return {
            current: this.completedProblems.size,
            total: this.problemQueue.length,
            percentage: Math.round((this.completedProblems.size / this.problemQueue.length) * 100)
        };
    }
    
    getProblemsByTopic(): Map<string, LeetCodeProblem[]> {
        const topicMap = new Map<string, LeetCodeProblem[]>();
        
        this.problemQueue.forEach(problem => {
            if (!topicMap.has(problem.topic)) {
                topicMap.set(problem.topic, []);
            }
            topicMap.get(problem.topic)!.push(problem);
        });
        
        return topicMap;
    }
    
    isAllComplete(): boolean {
        return this.currentProblemIndex >= this.problemQueue.length;
    }
}
```

### 2. Diamond Spawner with 3000m Spacing

Handles spawning diamonds every 3000 meters after problem completion.

```typescript
// entities/Blind75DiamondSpawner.ts
import { Blind75Manager } from '../systems/Blind75Manager';
import { LeetCodeProblem } from '../types/LeetCodeTypes';

export class Blind75DiamondSpawner {
    private scene: Phaser.Scene;
    private blind75Manager: Blind75Manager;
    private currentDiamond: Phaser.Physics.Arcade.Sprite | null = null;
    private lastSolvedDistance: number = 0;
    private diamondSpawnDistance: number = 0;
    
    // Configuration
    private readonly SPAWN_INTERVAL: number = 3000; // Meters between diamonds
    private readonly SPAWN_AHEAD_DISTANCE: number = 800; // How far ahead of screen to spawn
    
    constructor(scene: Phaser.Scene, blind75Manager: Blind75Manager) {
        this.scene = scene;
        this.blind75Manager = blind75Manager;
        
        // Set first diamond to spawn at 1000m
        this.diamondSpawnDistance = 1000;
    }
    
    update(currentDistance: number) {
        // Check if we should spawn a new diamond
        if (!this.currentDiamond && currentDistance >= this.diamondSpawnDistance) {
            const nextProblem = this.blind75Manager.getCurrentProblem();
            
            if (nextProblem) {
                this.spawnDiamond(nextProblem);
            } else {
                // All problems completed!
                this.handleAllProblemsComplete();
            }
        }
        
        // Clean up off-screen diamonds (if player missed it somehow)
        if (this.currentDiamond && this.currentDiamond.x < -100) {
            // Respawn the same diamond ahead
            this.respawnCurrentDiamond();
        }
    }
    
    private spawnDiamond(problem: LeetCodeProblem) {
        // Determine diamond appearance based on difficulty
        const diamondConfig = this.getDiamondConfig(problem.difficulty);
        
        // Create diamond sprite
        this.currentDiamond = this.scene.physics.add.sprite(
            this.scene.scale.width + this.SPAWN_AHEAD_DISTANCE,
            Phaser.Math.Between(200, 400), // Random height
            diamondConfig.sprite
        );
        
        // Store problem data in the diamond
        this.currentDiamond.setData('problem', problem);
        this.currentDiamond.setData('problemIndex', this.blind75Manager.getCurrentProblemIndex());
        
        // Set physics properties
        this.currentDiamond.setVelocityX(-200); // Move left with the world
        
        // Visual effects based on difficulty
        this.currentDiamond.setScale(diamondConfig.scale);
        this.currentDiamond.setTint(diamondConfig.tint);
        
        // Add floating animation
        this.scene.tweens.add({
            targets: this.currentDiamond,
            y: this.currentDiamond.y - 30,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add particle effects for harder problems
        if (problem.difficulty >= 7) {
            this.addParticleEffect(this.currentDiamond);
        }
    }
    
    private getDiamondConfig(difficulty: number): any {
        // Difficulty ranges from 1-10
        if (difficulty <= 3) {
            return {
                sprite: 'diamond_bronze',
                scale: 1.0,
                tint: 0xCD7F32,
                points: 100
            };
        } else if (difficulty <= 5) {
            return {
                sprite: 'diamond_silver',
                scale: 1.2,
                tint: 0xC0C0C0,
                points: 250
            };
        } else if (difficulty <= 7) {
            return {
                sprite: 'diamond_gold',
                scale: 1.4,
                tint: 0xFFD700,
                points: 500
            };
        } else {
            return {
                sprite: 'diamond_platinum',
                scale: 1.6,
                tint: 0xE5E4E2,
                points: 1000
            };
        }
    }
    
    private respawnCurrentDiamond() {
        if (this.currentDiamond) {
            // Move it back ahead of the player
            this.currentDiamond.x = this.scene.scale.width + this.SPAWN_AHEAD_DISTANCE;
            this.currentDiamond.y = Phaser.Math.Between(200, 400);
        }
    }
    
    onDiamondCollected(diamond: Phaser.Physics.Arcade.Sprite) {
        // Called when player catches the diamond
        if (diamond === this.currentDiamond) {
            this.currentDiamond.setVisible(false);
            this.currentDiamond.body.enable = false;
            // Don't destroy yet - wait for problem completion
        }
    }
    
    onProblemSolved(success: boolean, distanceTraveled: number) {
        if (success && this.currentDiamond) {
            // Destroy the current diamond
            this.currentDiamond.destroy();
            this.currentDiamond = null;
            
            // Mark problem as complete
            this.blind75Manager.markCurrentProblemComplete();
            
            // Set next diamond spawn distance (3000m from now)
            this.lastSolvedDistance = distanceTraveled;
            this.diamondSpawnDistance = distanceTraveled + this.SPAWN_INTERVAL;
        } else if (!success && this.currentDiamond) {
            // Problem failed - make diamond visible again
            this.currentDiamond.setVisible(true);
            this.currentDiamond.body.enable = true;
            this.respawnCurrentDiamond();
        }
    }
    
    private handleAllProblemsComplete() {
        // Create celebration effect
        this.scene.events.emit('blind75Complete');
    }
    
    private addParticleEffect(diamond: Phaser.Physics.Arcade.Sprite) {
        // Add sparkle effects for difficult problems
        const particles = this.scene.add.particles('sparkle');
        const emitter = particles.createEmitter({
            x: diamond.x,
            y: diamond.y,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000
        });
        
        // Follow the diamond
        this.scene.tweens.add({
            targets: emitter,
            x: diamond.x,
            y: diamond.y,
            duration: 100,
            repeat: -1
        });
    }
    
    getCurrentDiamond(): Phaser.Physics.Arcade.Sprite | null {
        return this.currentDiamond;
    }
}
```

### 3. LeetCode Challenge Scene

The complete challenge interface with code editor and test runner.

```typescript
// scenes/LeetCodeChallengeScene.ts
import Phaser from 'phaser';
import { LeetCodeProblem } from '../types/LeetCodeTypes';
import { CodeEditor } from '../ui/CodeEditor';
import { TestRunner } from '../systems/TestRunner';
import { Blind75Manager } from '../systems/Blind75Manager';

export class LeetCodeChallengeScene extends Phaser.Scene {
    private problem: LeetCodeProblem;
    private codeEditor: CodeEditor;
    private testRunner: TestRunner;
    private blind75Manager: Blind75Manager;
    private distanceTraveled: number;
    
    constructor() {
        super({ key: 'LeetCodeChallengeScene' });
    }
    
    create(data: { problem: LeetCodeProblem, distanceTraveled: number }) {
        this.problem = data.problem;
        this.distanceTraveled = data.distanceTraveled;
        
        // Create semi-transparent backdrop
        this.createBackdrop();
        
        // Initialize systems
        this.blind75Manager = new Blind75Manager(this);
        this.testRunner = new TestRunner();
        
        // Create UI layout
        this.createChallengeUI();
        
        // Initialize code editor
        this.initializeCodeEditor();
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    private createBackdrop() {
        const backdrop = this.add.rectangle(
            0, 0,
            this.scale.width,
            this.scale.height,
            0x000000, 0.85
        );
        backdrop.setOrigin(0, 0);
        backdrop.setInteractive(); // Block input to game scene
    }
    
    private createChallengeUI() {
        // Main container
        const container = this.add.container(this.scale.width / 2, this.scale.height / 2);
        
        // Challenge panel (full screen minus margins)
        const panelWidth = this.scale.width - 100;
        const panelHeight = this.scale.height - 100;
        
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x1e1e1e);
        panel.setStrokeStyle(3, 0x4CAF50);
        container.add(panel);
        
        // Left side - Problem description
        this.createProblemPanel(container, -panelWidth/4, 0, panelWidth/2 - 20, panelHeight - 40);
        
        // Right side - Code editor area
        this.createEditorPanel(container, panelWidth/4, -panelHeight/4, panelWidth/2 - 20, panelHeight/2 - 40);
        
        // Bottom right - Test results
        this.createTestPanel(container, panelWidth/4, panelHeight/4, panelWidth/2 - 20, panelHeight/2 - 60);
        
        // Control buttons
        this.createControlButtons(container, panelWidth/2 - 150, -panelHeight/2 + 30);
    }
    
    private createProblemPanel(container: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number) {
        // Problem info background
        const bg = this.add.rectangle(x, y, width, height, 0x2d2d30);
        bg.setStrokeStyle(1, 0x3e3e42);
        container.add(bg);
        
        // Problem number and title
        const title = this.add.text(x, y - height/2 + 30, 
            `${this.problem.number}. ${this.problem.title}`, {
            fontSize: '24px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        container.add(title);
        
        // Difficulty badge
        const difficultyColor = this.getDifficultyColor(this.problem.difficulty);
        const difficultyBadge = this.add.text(x + width/2 - 60, y - height/2 + 30,
            `Difficulty: ${this.problem.difficulty}/10`, {
            fontSize: '14px',
            color: difficultyColor,
            backgroundColor: '#1e1e1e',
            padding: { x: 10, y: 5 }
        });
        difficultyBadge.setOrigin(0.5);
        container.add(difficultyBadge);
        
        // Topic badges
        const topicText = this.add.text(x - width/2 + 60, y - height/2 + 30,
            `Topic: ${this.problem.topic}`, {
            fontSize: '14px',
            color: '#888',
            backgroundColor: '#1e1e1e',
            padding: { x: 10, y: 5 }
        });
        topicText.setOrigin(0.5);
        container.add(topicText);
        
        // Problem description (scrollable in real implementation)
        const description = this.add.text(x, y - height/2 + 80,
            this.problem.description, {
            fontSize: '16px',
            color: '#d4d4d4',
            wordWrap: { width: width - 40 },
            lineSpacing: 5
        });
        description.setOrigin(0.5, 0);
        container.add(description);
        
        // Examples
        const examplesY = y - height/2 + 200;
        const examplesTitle = this.add.text(x - width/2 + 20, examplesY,
            'Examples:', {
            fontSize: '18px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        examplesTitle.setOrigin(0);
        container.add(examplesTitle);
        
        // Example boxes
        this.problem.examples.forEach((example, index) => {
            const exampleY = examplesY + 40 + (index * 100);
            const exampleBg = this.add.rectangle(x, exampleY, width - 40, 80, 0x1e1e1e);
            exampleBg.setStrokeStyle(1, 0x3e3e42);
            container.add(exampleBg);
            
            const exampleText = this.add.text(x, exampleY,
                `Input: ${example.input}\nOutput: ${example.output}\n${example.explanation || ''}`, {
                fontSize: '14px',
                color: '#d4d4d4',
                fontFamily: 'monospace'
            });
            exampleText.setOrigin(0.5);
            container.add(exampleText);
        });
        
        // Constraints
        const constraintsY = y + height/2 - 100;
        const constraintsTitle = this.add.text(x - width/2 + 20, constraintsY,
            'Constraints:', {
            fontSize: '16px',
            color: '#4CAF50'
        });
        constraintsTitle.setOrigin(0);
        container.add(constraintsTitle);
        
        const constraintsText = this.add.text(x, constraintsY + 30,
            this.problem.constraints.join('\n'), {
            fontSize: '14px',
            color: '#888',
            fontFamily: 'monospace'
        });
        constraintsText.setOrigin(0.5);
        container.add(constraintsText);
    }
    
    private createEditorPanel(container: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number) {
        // Editor background
        const bg = this.add.rectangle(x, y, width, height, 0x1e1e1e);
        bg.setStrokeStyle(1, 0x3e3e42);
        container.add(bg);
        
        // Language selector
        const langSelector = this.add.text(x - width/2 + 20, y - height/2 + 10,
            'Language: JavaScript ▼', {
            fontSize: '14px',
            color: '#4CAF50',
            backgroundColor: '#2d2d30',
            padding: { x: 10, y: 5 }
        });
        langSelector.setInteractive({ useHandCursor: true });
        container.add(langSelector);
        
        // Code editor placeholder (in real implementation, use Monaco)
        const editorPlaceholder = this.add.rectangle(x, y + 20, width - 20, height - 60, 0x1e1e1e);
        container.add(editorPlaceholder);
        
        // Add DOM element for Monaco editor
        this.createMonacoEditor(x, y + 20, width - 20, height - 60);
    }
    
    private createMonacoEditor(x: number, y: number, width: number, height: number) {
        // Create DOM element for Monaco
        const editorDiv = document.createElement('div');
        editorDiv.id = 'monaco-editor';
        editorDiv.style.position = 'absolute';
        editorDiv.style.left = `${this.scale.width/2 + x - width/2}px`;
        editorDiv.style.top = `${this.scale.height/2 + y - height/2}px`;
        editorDiv.style.width = `${width}px`;
        editorDiv.style.height = `${height}px`;
        document.body.appendChild(editorDiv);
        
        // Initialize Monaco (in real implementation)
        this.codeEditor = new CodeEditor();
        this.codeEditor.initialize(editorDiv, this.problem);
    }
    
    private createTestPanel(container: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number) {
        // Test results background
        const bg = this.add.rectangle(x, y, width, height, 0x2d2d30);
        bg.setStrokeStyle(1, 0x3e3e42);
        container.add(bg);
        
        // Test results title
        const title = this.add.text(x - width/2 + 20, y - height/2 + 10,
            'Test Results', {
            fontSize: '16px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        title.setOrigin(0);
        container.add(title);
        
        // Test case results will be added dynamically
        this.createTestResultsArea(container, x, y, width, height);
    }
    
    private createTestResultsArea(container: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number) {
        // This will be populated after running tests
        const resultsArea = this.add.container(x, y);
        resultsArea.setName('testResults');
        container.add(resultsArea);
    }
    
    private createControlButtons(container: Phaser.GameObjects.Container, x: number, y: number) {
        // Run button
        const runButton = this.createButton(x - 200, y, 'Run Tests', 0x2196F3);
        runButton.on('pointerdown', () => this.runTests());
        container.add(runButton);
        
        // Submit button
        const submitButton = this.createButton(x - 50, y, 'Submit', 0x4CAF50);
        submitButton.on('pointerdown', () => this.submitSolution());
        container.add(submitButton);
        
        // Hints button
        const hintsButton = this.createButton(x + 100, y, 'Hint (-25pts)', 0xFF9800);
        hintsButton.on('pointerdown', () => this.showHint());
        container.add(hintsButton);
        
        // Skip button (costs points)
        const skipButton = this.createButton(x + 250, y, 'Skip (-100pts)', 0xf44336);
        skipButton.on('pointerdown', () => this.skipProblem());
        container.add(skipButton);
    }
    
    private createButton(x: number, y: number, text: string, color: number): Phaser.GameObjects.Container {
        const button = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 120, 40, color);
        bg.setInteractive({ useHandCursor: true });
        button.add(bg);
        
        const label = this.add.text(0, 0, text, {
            fontSize: '14px',
            color: '#ffffff'
        });
        label.setOrigin(0.5);
        button.add(label);
        
        bg.on('pointerover', () => bg.setFillStyle(color + 0x222222));
        bg.on('pointerout', () => bg.setFillStyle(color));
        
        return button;
    }
    
    private async runTests() {
        const code = this.codeEditor.getCode();
        const results = await this.testRunner.runTests(code, this.problem);
        this.displayTestResults(results);
    }
    
    private displayTestResults(results: any[]) {
        const resultsContainer = this.children.getByName('testResults') as Phaser.GameObjects.Container;
        resultsContainer.removeAll(true);
        
        results.forEach((result, index) => {
            const y = index * 60 + 40;
            const passed = result.passed;
            const color = passed ? 0x4CAF50 : 0xf44336;
            const icon = passed ? '✓' : '✗';
            
            const testCase = this.add.text(-200, y,
                `Test ${index + 1}: ${icon}`, {
                fontSize: '14px',
                color: passed ? '#4CAF50' : '#f44336'
            });
            resultsContainer.add(testCase);
            
            const details = this.add.text(-200, y + 20,
                `Input: ${JSON.stringify(result.input)}\n` +
                `Expected: ${JSON.stringify(result.expected)}\n` +
                `Got: ${JSON.stringify(result.actual)}`, {
                fontSize: '12px',
                color: '#888',
                fontFamily: 'monospace'
            });
            resultsContainer.add(details);
        });
    }
    
    private async submitSolution() {
        const code = this.codeEditor.getCode();
        const results = await this.testRunner.runAllTests(code, this.problem);
        
        const allPassed = results.every(r => r.passed);
        
        if (allPassed) {
            this.showSuccess();
            
            // Notify game scene
            this.scene.get('GameScene').events.emit('problemSolved', {
                success: true,
                distanceTraveled: this.distanceTraveled
            });
            
            // Close after delay
            this.time.delayedCall(2000, () => {
                this.cleanup();
                this.scene.stop();
                this.scene.resume('GameScene');
            });
        } else {
            this.showFailure(results);
        }
    }
    
    private showSuccess() {
        const successOverlay = this.add.container(this.scale.width/2, this.scale.height/2);
        
        const bg = this.add.rectangle(0, 0, 400, 200, 0x4CAF50);
        bg.setAlpha(0.95);
        successOverlay.add(bg);
        
        const text = this.add.text(0, -30, '✓ All Tests Passed!', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        successOverlay.add(text);
        
        const stats = this.add.text(0, 30, 
            `Problem ${this.problem.number}/75 Complete\n` +
            `Earned ${this.problem.reward} points`, {
            fontSize: '18px',
            color: '#ffffff'
        });
        stats.setOrigin(0.5);
        successOverlay.add(stats);
        
        // Animation
        successOverlay.setScale(0);
        this.tweens.add({
            targets: successOverlay,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }
    
    private showFailure(results: any[]) {
        const failedCount = results.filter(r => !r.passed).length;
        
        const failureOverlay = this.add.container(this.scale.width/2, this.scale.height/2);
        
        const bg = this.add.rectangle(0, 0, 400, 200, 0xf44336);
        bg.setAlpha(0.95);
        failureOverlay.add(bg);
        
        const text = this.add.text(0, -30, '✗ Tests Failed', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        failureOverlay.add(text);
        
        const details = this.add.text(0, 30,
            `${failedCount} test(s) failed\nCheck your solution and try again`, {
            fontSize: '18px',
            color: '#ffffff'
        });
        details.setOrigin(0.5);
        failureOverlay.add(details);
        
        // Auto-hide after 3 seconds
        this.time.delayedCall(3000, () => {
            failureOverlay.destroy();
        });
    }
    
    private showHint() {
        // Implementation for showing hints
        const hints = this.problem.hints || [];
        // Show next hint that hasn't been shown
        // Deduct points for using hint
    }
    
    private skipProblem() {
        // Allow skipping but with penalty
        this.scene.get('GameScene').events.emit('problemSkipped', {
            problem: this.problem,
            penalty: 100
        });
        
        this.cleanup();
        this.scene.stop();
        this.scene.resume('GameScene');
    }
    
    private setupKeyboardShortcuts() {
        this.input.keyboard?.on('keydown-ESC', () => {
            this.cleanup();
            this.scene.stop();
            this.scene.resume('GameScene');
        });
        
        // Ctrl+Enter to run tests
        this.input.keyboard?.on('keydown-CTRL-ENTER', () => {
            this.runTests();
        });
    }
    
    private getDifficultyColor(difficulty: number): string {
        if (difficulty <= 3) return '#4CAF50'; // Easy - Green
        if (difficulty <= 6) return '#FFC107'; // Medium - Yellow
        if (difficulty <= 8) return '#FF9800'; // Hard - Orange
        return '#f44336'; // Very Hard - Red
    }
    
    private cleanup() {
        // Remove Monaco editor DOM element
        const editorElement = document.getElementById('monaco-editor');
        if (editorElement) {
            editorElement.remove();
        }
    }
    
    private initializeCodeEditor() {
        // Implemented in createMonacoEditor
    }
}
```

### 4. Code Editor with Monaco Integration

```typescript
// ui/CodeEditor.ts
import * as monaco from 'monaco-editor';
import { LeetCodeProblem } from '../types/LeetCodeTypes';

export class CodeEditor {
    private editor: monaco.editor.IStandaloneCodeEditor;
    private currentProblem: LeetCodeProblem;
    private language: string = 'javascript';
    
    initialize(container: HTMLElement, problem: LeetCodeProblem) {
        this.currentProblem = problem;
        
        // Create Monaco editor instance
        this.editor = monaco.editor.create(container, {
            value: this.getStarterCode(),
            language: this.language,
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            tabSize: 2,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            quickSuggestions: {
                other: true,
                comments: true,
                strings: true
            }
        });
        
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    private getStarterCode(): string {
        const templates = {
            javascript: {
                default: `/**
 * ${this.currentProblem.functionSignature}
 */
${this.currentProblem.starterCode || this.getDefaultStarterCode()}`,
            },
            python: {
                default: `class Solution:
    ${this.currentProblem.starterCodePython || this.getDefaultStarterCodePython()}`
            },
            java: {
                default: `class Solution {
    ${this.currentProblem.starterCodeJava || this.getDefaultStarterCodeJava()}
}`
            }
        };
        
        return templates[this.language]?.default || '';
    }
    
    private getDefaultStarterCode(): string {
        // Generate default starter code based on problem
        return `function ${this.currentProblem.functionName}(${this.currentProblem.parameters.join(', ')}) {
    // Your code here
    
}`;
    }
    
    private getDefaultStarterCodePython(): string {
        return `def ${this.currentProblem.functionName}(self, ${this.currentProblem.parameters.join(', ')}):
        # Your code here
        pass`;
    }
    
    private getDefaultStarterCodeJava(): string {
        return `public ${this.currentProblem.returnType} ${this.currentProblem.functionName}(${this.currentProblem.parametersJava}) {
        // Your code here
        
    }`;
    }
    
    getCode(): string {
        return this.editor.getValue();
    }
    
    setCode(code: string) {
        this.editor.setValue(code);
    }
    
    changeLanguage(language: string) {
        this.language = language;
        monaco.editor.setModelLanguage(this.editor.getModel()!, language);
        this.editor.setValue(this.getStarterCode());
    }
    
    private setupKeyboardShortcuts() {
        // Add custom keyboard shortcuts
        this.editor.addAction({
            id: 'run-tests',
            label: 'Run Tests',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => {
                // Trigger test run event
                document.dispatchEvent(new CustomEvent('runTests'));
            }
        });
    }
    
    dispose() {
        this.editor.dispose();
    }
}
```

### 5. Test Runner System

```typescript
// systems/TestRunner.ts
import { LeetCodeProblem, TestCase, TestResult } from '../types/LeetCodeTypes';

export class TestRunner {
    private worker: Worker | null = null;
    
    async runTests(code: string, problem: LeetCodeProblem): Promise<TestResult[]> {
        // Run only the visible test cases
        return this.runTestCases(code, problem.testCases, problem);
    }
    
    async runAllTests(code: string, problem: LeetCodeProblem): Promise<TestResult[]> {
        // Run both visible and hidden test cases
        const allTestCases = [...problem.testCases, ...(problem.hiddenTestCases || [])];
        return this.runTestCases(code, allTestCases, problem);
    }
    
    private async runTestCases(code: string, testCases: TestCase[], problem: LeetCodeProblem): Promise<TestResult[]> {
        const results: TestResult[] = [];
        
        for (const testCase of testCases) {
            try {
                const result = await this.executeTest(code, testCase, problem);
                results.push(result);
            } catch (error) {
                results.push({
                    passed: false,
                    input: testCase.input,
                    expected: testCase.expected,
                    actual: null,
                    error: error.message,
                    executionTime: 0
                });
            }
        }
        
        return results;
    }
    
    private async executeTest(code: string, testCase: TestCase, problem: LeetCodeProblem): Promise<TestResult> {
        return new Promise((resolve, reject) => {
            // Create a new worker for each test (for isolation)
            this.worker = new Worker('/workers/testRunner.worker.js');
            
            // Set timeout for execution
            const timeout = setTimeout(() => {
                this.worker?.terminate();
                reject(new Error('Time Limit Exceeded'));
            }, 5000); // 5 second timeout
            
            this.worker.onmessage = (event) => {
                clearTimeout(timeout);
                const { success, result, error, executionTime } = event.data;
                
                if (success) {
                    const passed = this.compareResults(result, testCase.expected);
                    resolve({
                        passed,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual: result,
                        error: null,
                        executionTime
                    });
                } else {
                    resolve({
                        passed: false,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual: null,
                        error: error,
                        executionTime: 0
                    });
                }
                
                this.worker?.terminate();
            };
            
            this.worker.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
                this.worker?.terminate();
            };
            
            // Send code and test case to worker
            this.worker.postMessage({
                code,
                functionName: problem.functionName,
                input: testCase.input
            });
        });
    }
    
    private compareResults(actual: any, expected: any): boolean {
        // Deep comparison for arrays and objects
        return JSON.stringify(actual) === JSON.stringify(expected);
    }
}

// workers/testRunner.worker.js
self.onmessage = async function(event) {
    const { code, functionName, input } = event.data;
    const startTime = performance.now();
    
    try {
        // Create function from code string
        const wrappedCode = `
            ${code}
            return ${functionName}(${JSON.stringify(input)});
        `;
        
        const func = new Function(wrappedCode);
        const result = func();
        
        const executionTime = performance.now() - startTime;
        
        self.postMessage({
            success: true,
            result,
            executionTime
        });
    } catch (error) {
        self.postMessage({
            success: false,
            error: error.message
        });
    }
};
```

### 6. Type Definitions

```typescript
// types/LeetCodeTypes.ts
export interface LeetCodeProblem {
    id: string;
    number: number;
    title: string;
    difficulty: number; // 1-10 scale for granular difficulty
    leetcodeDifficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    topics: string[]; // Multiple topics
    description: string;
    examples: Example[];
    constraints: string[];
    hints?: string[];
    functionName: string;
    functionSignature: string;
    parameters: string[];
    parametersJava?: string;
    returnType: string;
    starterCode?: string;
    starterCodePython?: string;
    starterCodeJava?: string;
    testCases: TestCase[];
    hiddenTestCases?: TestCase[];
    reward: number;
    companies?: string[]; // Companies that ask this question
    similarProblems?: string[]; // IDs of similar problems
}

export interface Example {
    input: string;
    output: string;
    explanation?: string;
}

export interface TestCase {
    input: any;
    expected: any;
}

export interface TestResult {
    passed: boolean;
    input: any;
    expected: any;
    actual: any;
    error: string | null;
    executionTime: number;
}
```

### 7. Blind 75 Problem Data

```json
// assets/data/blind75_ordered.json
{
  "problems": [
    {
      "id": "contains_duplicate",
      "number": 1,
      "title": "Contains Duplicate",
      "difficulty": 1,
      "leetcodeDifficulty": "Easy",
      "topic": "Arrays & Hashing",
      "topics": ["Array", "Hash Table"],
      "description": "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
      "examples": [
        {
          "input": "nums = [1,2,3,1]",
          "output": "true",
          "explanation": "The element 1 appears twice"
        },
        {
          "input": "nums = [1,2,3,4]",
          "output": "false",
          "explanation": "All elements are distinct"
        }
      ],
      "constraints": [
        "1 <= nums.length <= 10^5",
        "-10^9 <= nums[i] <= 10^9"
      ],
      "hints": [
        "Consider using a hash set to track seen elements",
        "What's the time complexity of checking if an element exists in a hash set?"
      ],
      "functionName": "containsDuplicate",
      "functionSignature": "@param {number[]} nums\n@return {boolean}",
      "parameters": ["nums"],
      "returnType": "boolean",
      "starterCode": "var containsDuplicate = function(nums) {\n    \n};",
      "testCases": [
        {
          "input": [1,2,3,1],
          "expected": true
        },
        {
          "input": [1,2,3,4],
          "expected": false
        }
      ],
      "hiddenTestCases": [
        {
          "input": [1,1,1,3,3,4,3,2,4,2],
          "expected": true
        }
      ],
      "reward": 100,
      "companies": ["Amazon", "Apple", "Adobe"]
    },
    {
      "id": "valid_anagram",
      "number": 2,
      "title": "Valid Anagram",
      "difficulty": 1,
      "leetcodeDifficulty": "Easy",
      "topic": "Arrays & Hashing",
      "topics": ["Hash Table", "String", "Sorting"],
      "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
      "examples": [
        {
          "input": "s = \"anagram\", t = \"nagaram\"",
          "output": "true"
        },
        {
          "input": "s = \"rat\", t = \"car\"",
          "output": "false"
        }
      ],
      "constraints": [
        "1 <= s.length, t.length <= 5 * 10^4",
        "s and t consist of lowercase English letters"
      ],
      "hints": [
        "What defines an anagram?",
        "Consider counting character frequencies",
        "Could sorting help?"
      ],
      "functionName": "isAnagram",
      "functionSignature": "@param {string} s\n@param {string} t\n@return {boolean}",
      "parameters": ["s", "t"],
      "returnType": "boolean",
      "starterCode": "var isAnagram = function(s, t) {\n    \n};",
      "testCases": [
        {
          "input": { "s": "anagram", "t": "nagaram" },
          "expected": true
        },
        {
          "input": { "s": "rat", "t": "car" },
          "expected": false
        }
      ],
      "reward": 100
    },
    {
      "id": "two_sum",
      "number": 3,
      "title": "Two Sum",
      "difficulty": 2,
      "leetcodeDifficulty": "Easy",
      "topic": "Arrays & Hashing",
      "topics": ["Array", "Hash Table"],
      "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      "examples": [
        {
          "input": "nums = [2,7,11,15], target = 9",
          "output": "[0,1]",
          "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]"
        }
      ],
      "constraints": [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists"
      ],
      "hints": [
        "A brute force approach would use two loops",
        "Can you do it in one pass?",
        "Think about what you're looking for: target - current element"
      ],
      "functionName": "twoSum",
      "functionSignature": "@param {number[]} nums\n@param {number} target\n@return {number[]}",
      "parameters": ["nums", "target"],
      "returnType": "number[]",
      "starterCode": "var twoSum = function(nums, target) {\n    \n};",
      "testCases": [
        {
          "input": { "nums": [2,7,11,15], "target": 9 },
          "expected": [0,1]
        },
        {
          "input": { "nums": [3,2,4], "target": 6 },
          "expected": [1,2]
        }
      ],
      "reward": 150
    }
    // ... Continue with all 75 problems in order of difficulty
  ]
}
```

### 8. Updated Game Scene Integration

```typescript
// scenes/GameScene.ts (Updated sections)
import { Blind75DiamondSpawner } from '../entities/Blind75DiamondSpawner';
import { Blind75Manager } from '../systems/Blind75Manager';

export class GameScene extends Phaser.Scene {
    private player: Player;
    private distanceTraveled: number = 0;
    private diamondSpawner: Blind75DiamondSpawner;
    private blind75Manager: Blind75Manager;
    private scoreDisplay: Phaser.GameObjects.Text;
    private progressDisplay: Phaser.GameObjects.Text;
    
    create() {
        // Initialize Blind 75 system
        this.blind75Manager = new Blind75Manager(this);
        
        // Initialize player
        this.player = new Player(this, 100, 300);
        
        // Initialize diamond spawner with Blind 75 manager
        this.diamondSpawner = new Blind75DiamondSpawner(this, this.blind75Manager);
        
        // Set up collision detection
        this.physics.add.overlap(
            this.player.sprite,
            this.diamondSpawner.getCurrentDiamond(),
            this.handleDiamondCollision,
            null,
            this
        );
        
        // Listen for problem solved events
        this.events.on('problemSolved', this.onProblemSolved, this);
        this.events.on('problemSkipped', this.onProblemSkipped, this);
        
        // Create UI
        this.createUI();
    }
    
    update(time: number, delta: number) {
        // Update distance traveled
        this.distanceTraveled += delta * 0.2; // Adjust speed as needed
        
        // Update entities
        this.player.update(time, delta);
        this.diamondSpawner.update(this.distanceTraveled);
        
        // Update UI
        this.updateUI();
        
        // Check for new diamond collision
        const currentDiamond = this.diamondSpawner.getCurrentDiamond();
        if (currentDiamond && !this.physics.world.overlap(this.player.sprite, currentDiamond)) {
            // Re-enable collision check if diamond respawned
            this.physics.add.overlap(
                this.player.sprite,
                currentDiamond,
                this.handleDiamondCollision,
                null,
                this
            );
        }
    }
    
    private handleDiamondCollision(playerSprite: any, diamond: any) {
        // Get problem from diamond
        const problem = diamond.getData('problem');
        
        // Mark diamond as collected
        this.diamondSpawner.onDiamondCollected(diamond);
        
        // Pause the game scene
        this.scene.pause();
        
        // Launch LeetCode challenge scene
        this.scene.launch('LeetCodeChallengeScene', {
            problem: problem,
            distanceTraveled: this.distanceTraveled
        });
    }
    
    private onProblemSolved(data: { success: boolean, distanceTraveled: number }) {
        // Notify spawner that problem was solved
        this.diamondSpawner.onProblemSolved(data.success, data.distanceTraveled);
        
        if (data.success) {
            // Update score
            const problem = this.blind75Manager.getCurrentProblem();
            this.addScore(problem.reward);
            
            // Check if all problems complete
            if (this.blind75Manager.isAllComplete()) {
                this.handleGameComplete();
            }
        }
    }
    
    private onProblemSkipped(data: { problem: any, penalty: number }) {
        // Allow skip but with penalty
        this.addScore(-data.penalty);
        this.diamondSpawner.onProblemSolved(true, this.distanceTraveled);
    }
    
    private createUI() {
        // Distance display
        this.add.text(20, 20, 'Distance:', {
            fontSize: '20px',
            color: '#ffffff'
        });
        
        // Progress display
        const progress = this.blind75Manager.getProgress();
        this.progressDisplay = this.add.text(20, 50, 
            `Progress: ${progress.current}/${progress.total} (${progress.percentage}%)`, {
            fontSize: '18px',
            color: '#4CAF50'
        });
        
        // Current problem display
        const currentProblem = this.blind75Manager.getCurrentProblem();
        if (currentProblem) {
            this.add.text(20, 80, 
                `Next: ${currentProblem.number}. ${currentProblem.title}`, {
                fontSize: '16px',
                color: '#FFC107'
            });
        }
        
        // Score display
        this.scoreDisplay = this.add.text(20, 110, 'Score: 0', {
            fontSize: '20px',
            color: '#ffffff'
        });
    }
    
    private updateUI() {
        // Update distance
        const distanceText = `Distance: ${Math.floor(this.distanceTraveled)}m`;
        
        // Update progress
        const progress = this.blind75Manager.getProgress();
        this.progressDisplay.setText(
            `Progress: ${progress.current}/${progress.total} (${progress.percentage}%)`
        );
    }
    
    private addScore(points: number) {
        // Update score logic
    }
    
    private handleGameComplete() {
        // Show completion screen
        this.scene.launch('CompletionScene', {
            totalTime: this.time.now,
            totalDistance: this.distanceTraveled
        });
    }
}
```

## Key Implementation Points

### 3000-Meter Spacing Logic
- After each problem is solved, the next diamond spawns exactly 3000 meters ahead
- The spawner tracks `lastSolvedDistance` and adds 3000 to determine `nextSpawnDistance`
- Diamonds only spawn when the player reaches the designated distance

### Sequential Problem Order
- Problems are loaded in a specific order from easiest to hardest
- The `Blind75Manager` maintains a queue and current index
- Players cannot skip ahead in the sequence (though they can skip with penalty)

### Difficulty Progression
- Visual indicators (color, size, particles) show problem difficulty
- Reward points scale with difficulty
- Hints available but cost points

### Progress Persistence
- Progress saves to localStorage automatically
- Includes current problem index, completed problems, and solutions
- Game can be resumed from where player left off

### Test Execution
- Code runs in Web Workers for safety and isolation
- 5-second timeout for infinite loops
- Both visible and hidden test cases for verification

## Benefits of This Architecture

1. **Enforced Learning Path**: Players progress through problems in optimal learning order
2. **Clear Progression**: Always know exactly which problem you're on (23/75)
3. **No Confusion**: Can't accidentally get a hard problem early
4. **Motivation**: 3000m spacing gives a sense of achievement and breathing room
5. **Replayability**: Can retry problems for better solutions
6. **Persistence**: Progress saves automatically

## Future Enhancements

1. **Leaderboards**: Track completion times and scores
2. **Solution Optimization**: Grade solutions on time/space complexity
3. **Multiplayer Racing**: Compete with others in real-time
4. **Daily Challenges**: Special problems with bonus rewards
5. **Achievement System**: Badges for completing topics, streaks, etc.
6. **Solution Sharing**: View community solutions after solving
7. **Video Tutorials**: Link to explanation videos for each problem