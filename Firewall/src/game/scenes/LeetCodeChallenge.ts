import { Scene } from 'phaser';
import { LeetCodeProblem, TestResult } from '../types/LeetCodeTypes';
import * as monaco from 'monaco-editor';

export class LeetCodeChallenge extends Scene {
    private problem!: LeetCodeProblem;
    private distanceTraveled!: number;
    private editor!: monaco.editor.IStandaloneCodeEditor;
    private editorContainer!: HTMLElement;
    private currentLanguage: 'javascript' | 'python' = 'javascript';
    private languageBadge!: Phaser.GameObjects.Text;
    private codeByLanguage: Map<string, string> = new Map();

    constructor() {
        super('LeetCodeChallenge');
    }

    create(data: { problem: LeetCodeProblem, distanceTraveled: number }) {
        this.problem = data.problem;
        this.distanceTraveled = data.distanceTraveled;

        console.log('LeetCodeChallenge launched with problem:', this.problem);

        // Create semi-transparent backdrop
        this.createBackdrop();

        // Create UI layout
        this.createChallengeUI();

        // Initialize Monaco editor
        this.initializeMonacoEditor();
    }

    private createBackdrop() {
        const backdrop = this.add.rectangle(
            0, 0,
            this.scale.width,
            this.scale.height,
            0x000000, 0.90
        );
        backdrop.setOrigin(0, 0);
        backdrop.setInteractive(); // Block input to game scene
    }

    private createChallengeUI() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Main panel
        const panelWidth = this.scale.width - 100;
        const panelHeight = this.scale.height - 100;

        const panel = this.add.rectangle(centerX, centerY, panelWidth, panelHeight, 0x1e1e1e);
        panel.setStrokeStyle(3, 0x4CAF50);

        // Split into two columns: left = problem description, right = code editor
        const leftX = centerX - panelWidth / 4;
        const rightX = centerX + panelWidth / 4;
        const columnWidth = panelWidth / 2 - 40;

        // === LEFT COLUMN: Problem Description ===
        this.createProblemPanel(leftX, centerY, columnWidth, panelHeight - 40);

        // === RIGHT COLUMN: Code Editor ===
        this.createEditorPanel(rightX, centerY, columnWidth, panelHeight - 40);

        // === CONTROL BUTTONS AT BOTTOM ===
        this.createControlButtons(centerX, centerY + panelHeight / 2 - 50);
    }

    private createProblemPanel(x: number, y: number, width: number, height: number) {
        const topY = y - height / 2 + 20;

        // Title
        const title = this.add.text(x, topY,
            `${this.problem.number}. ${this.problem.title}`, {
            fontSize: '24px',
            color: '#4CAF50',
            fontStyle: 'bold',
            wordWrap: { width: width - 20 }
        });
        title.setOrigin(0.5, 0);

        // Difficulty and Topic badges
        const badgeY = topY + title.height + 15;
        const difficultyColor = this.getDifficultyColor(this.problem.difficulty);
        const difficultyBadge = this.add.text(x - 60, badgeY,
            `${this.problem.leetcodeDifficulty}`, {
            fontSize: '14px',
            color: difficultyColor,
            backgroundColor: '#2d2d30',
            padding: { x: 8, y: 4 }
        });
        difficultyBadge.setOrigin(0.5, 0);

        const topicBadge = this.add.text(x + 60, badgeY,
            this.problem.topic, {
            fontSize: '14px',
            color: '#888',
            backgroundColor: '#2d2d30',
            padding: { x: 8, y: 4 }
        });
        topicBadge.setOrigin(0.5, 0);

        // Description
        let contentY = badgeY + 40;
        const description = this.add.text(x - width / 2 + 20, contentY,
            this.problem.description, {
            fontSize: '16px',
            color: '#d4d4d4',
            wordWrap: { width: width - 40 },
            lineSpacing: 5
        });
        description.setOrigin(0, 0);

        // Examples
        contentY += description.height + 20;
        const examplesTitle = this.add.text(x - width / 2 + 20, contentY,
            'Examples:', {
            fontSize: '18px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        examplesTitle.setOrigin(0, 0);

        contentY += examplesTitle.height + 10;
        this.problem.examples.forEach((example, index) => {
            const exampleText = this.add.text(x - width / 2 + 30, contentY,
                `Example ${index + 1}:\n` +
                `Input: ${example.input}\n` +
                `Output: ${example.output}` +
                (example.explanation ? `\nExplanation: ${example.explanation}` : ''), {
                fontSize: '14px',
                color: '#d4d4d4',
                fontFamily: 'Courier New, monospace',
                backgroundColor: '#2d2d30',
                padding: { x: 8, y: 8 },
                wordWrap: { width: width - 60 }
            });
            exampleText.setOrigin(0, 0);
            contentY += exampleText.height + 10;
        });

        // Constraints
        contentY += 10;
        const constraintsTitle = this.add.text(x - width / 2 + 20, contentY,
            'Constraints:', {
            fontSize: '18px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        constraintsTitle.setOrigin(0, 0);

        contentY += constraintsTitle.height + 10;
        const constraintsText = this.add.text(x - width / 2 + 30, contentY,
            this.problem.constraints.map(c => `• ${c}`).join('\n'), {
            fontSize: '13px',
            color: '#888',
            fontFamily: 'Courier New, monospace',
            wordWrap: { width: width - 60 }
        });
        constraintsText.setOrigin(0, 0);
    }

    private createEditorPanel(x: number, y: number, width: number, height: number) {
        const topY = y - height / 2 + 20;

        // Editor title
        const editorTitle = this.add.text(x, topY,
            'Code Editor', {
            fontSize: '18px',
            color: '#4CAF50',
            fontStyle: 'bold'
        });
        editorTitle.setOrigin(0.5, 0);

        // Language selector buttons
        const jsButton = this.add.text(x - width / 2 + 20, topY,
            'JavaScript', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#FFC107',
            padding: { x: 8, y: 4 }
        });
        jsButton.setOrigin(0, 0);
        jsButton.setInteractive({ useHandCursor: true });
        jsButton.on('pointerdown', () => this.switchLanguage('javascript'));

        const pythonButton = this.add.text(x - width / 2 + 110, topY,
            'Python', {
            fontSize: '14px',
            color: '#cccccc',
            backgroundColor: '#2d2d30',
            padding: { x: 8, y: 4 }
        });
        pythonButton.setOrigin(0, 0);
        pythonButton.setInteractive({ useHandCursor: true });
        pythonButton.on('pointerdown', () => this.switchLanguage('python'));

        // Store reference to language badge for updates
        this.languageBadge = jsButton;

        // Store both buttons for toggling active state
        (jsButton as any).pythonButton = pythonButton;

        // Monaco editor will be mounted here as DOM element
        // We'll create the DOM container but not add visual elements in Phaser
    }

    private initializeMonacoEditor() {
        // Initialize starter code for both languages
        this.codeByLanguage.set('javascript', this.problem.starterCode || this.getDefaultStarterCode('javascript'));
        this.codeByLanguage.set('python', this.problem.starterCodePython || this.getDefaultStarterCode('python'));

        // Create DOM element for Monaco editor
        this.editorContainer = document.createElement('div');
        this.editorContainer.id = 'monaco-editor-container';
        this.editorContainer.style.position = 'absolute';

        // Position on right side of screen
        const panelWidth = this.scale.width - 100;
        const panelHeight = this.scale.height - 100;
        const columnWidth = panelWidth / 2 - 40;

        const leftOffset = (this.scale.width - panelWidth) / 2 + panelWidth / 2 + 20;
        const topOffset = (this.scale.height - panelHeight) / 2 + 80;

        this.editorContainer.style.left = `${leftOffset}px`;
        this.editorContainer.style.top = `${topOffset}px`;
        this.editorContainer.style.width = `${columnWidth - 30}px`;
        this.editorContainer.style.height = `${panelHeight - 100}px`;
        this.editorContainer.style.border = '2px solid #3e3e42';

        document.body.appendChild(this.editorContainer);

        // Initialize Monaco editor
        this.editor = monaco.editor.create(this.editorContainer, {
            value: this.codeByLanguage.get('javascript')!,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderWhitespace: 'selection'
        });

        console.log('Monaco editor initialized');
    }

    private getDefaultStarterCode(language: 'javascript' | 'python'): string {
        if (language === 'python') {
            // Convert camelCase to snake_case for Python
            const pythonFunctionName = this.problem.functionName.replace(/([A-Z])/g, '_$1').toLowerCase();
            return `def ${pythonFunctionName}(${this.problem.parameters.join(', ')}):\n    # Write your solution here\n    pass\n`;
        } else {
            return `var ${this.problem.functionName} = function(${this.problem.parameters.join(', ')}) {\n    // Write your solution here\n    \n};\n`;
        }
    }

    private switchLanguage(language: 'javascript' | 'python') {
        if (language === this.currentLanguage) return;

        // Save current code before switching
        this.codeByLanguage.set(this.currentLanguage, this.editor.getValue());

        // Update language
        this.currentLanguage = language;

        // Get code for new language or use default
        const newCode = this.codeByLanguage.get(language) || this.getDefaultStarterCode(language);

        // Update Monaco editor
        monaco.editor.setModelLanguage(this.editor.getModel()!, language);
        this.editor.setValue(newCode);

        // Update UI - toggle button states
        const jsButton = this.languageBadge;
        const pythonButton = (jsButton as any).pythonButton;

        if (language === 'javascript') {
            jsButton.setStyle({
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#FFC107',
                padding: { x: 8, y: 4 }
            });
            pythonButton.setStyle({
                fontSize: '14px',
                color: '#cccccc',
                backgroundColor: '#2d2d30',
                padding: { x: 8, y: 4 }
            });
        } else {
            jsButton.setStyle({
                fontSize: '14px',
                color: '#cccccc',
                backgroundColor: '#2d2d30',
                padding: { x: 8, y: 4 }
            });
            pythonButton.setStyle({
                fontSize: '14px',
                color: '#ffffff',
                backgroundColor: '#3776AB', // Python blue
                padding: { x: 8, y: 4 }
            });
        }

        console.log(`Switched to ${language}`);
    }

    private createControlButtons(x: number, y: number) {
        // Run Tests button
        const runButton = this.createButton(x - 300, y, 'Run Tests', 0x2196F3);
        runButton.on('pointerdown', () => this.runTests());

        // Submit button
        const submitButton = this.createButton(x - 100, y, 'Submit', 0x4CAF50);
        submitButton.on('pointerdown', () => this.submitSolution());

        // Skip button
        const skipButton = this.createButton(x + 100, y, 'Skip', 0xf44336);
        skipButton.on('pointerdown', () => this.skipProblem());

        // Close button
        const closeButton = this.createButton(x + 300, y, 'Close (ESC)', 0x666666);
        closeButton.on('pointerdown', () => this.closeChallenge());

        // Setup keyboard shortcuts
        this.input.keyboard?.on('keydown-ESC', () => {
            this.closeChallenge();
        });
    }

    private createButton(x: number, y: number, text: string, color: number): Phaser.GameObjects.Container {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 150, 45, color);
        bg.setInteractive({ useHandCursor: true });
        button.add(bg);

        const label = this.add.text(0, 0, text, {
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        label.setOrigin(0.5);
        button.add(label);

        // Hover effect
        bg.on('pointerover', () => {
            bg.setFillStyle(color + 0x333333);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(color);
        });

        return button;
    }

    private runTests() {
        const code = this.editor.getValue();
        console.log('Running tests with code:', code);

        try {
            // Execute the user's code
            const userFunction = this.evaluateUserCode(code);

            // Run visible test cases
            const results = this.problem.testCases.map((testCase) => {
                try {
                    const startTime = performance.now();
                    // Handle input - if it's already an array, wrap it; if not, use as is
                    const args = Array.isArray(testCase.input) && !Array.isArray(testCase.input[0])
                        ? [testCase.input]
                        : Array.isArray(testCase.input)
                        ? testCase.input
                        : [testCase.input];

                    const actual = userFunction(...args);
                    const executionTime = performance.now() - startTime;

                    const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);

                    return {
                        passed,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual,
                        error: null,
                        executionTime
                    } as TestResult;
                } catch (error) {
                    return {
                        passed: false,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual: null,
                        error: error instanceof Error ? error.message : String(error),
                        executionTime: 0
                    } as TestResult;
                }
            });

            // Display test results
            this.showTestResults(results);
        } catch (error) {
            this.showError(error instanceof Error ? error.message : 'Failed to compile code');
        }
    }

    private submitSolution() {
        const code = this.editor.getValue();
        console.log('Submitting solution:', code);

        try {
            // Execute the user's code
            const userFunction = this.evaluateUserCode(code);

            // Run all test cases (including hidden ones)
            const allTests = [
                ...this.problem.testCases,
                ...(this.problem.hiddenTestCases || [])
            ];

            const results = allTests.map(testCase => {
                try {
                    const startTime = performance.now();
                    // Handle input - if it's already an array, wrap it; if not, use as is
                    const args = Array.isArray(testCase.input) && !Array.isArray(testCase.input[0])
                        ? [testCase.input]
                        : Array.isArray(testCase.input)
                        ? testCase.input
                        : [testCase.input];

                    const actual = userFunction(...args);
                    const executionTime = performance.now() - startTime;

                    const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);

                    return {
                        passed,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual,
                        error: null,
                        executionTime
                    } as TestResult;
                } catch (error) {
                    return {
                        passed: false,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual: null,
                        error: error instanceof Error ? error.message : String(error),
                        executionTime: 0
                    } as TestResult;
                }
            });

            // Check if all tests passed
            const allPassed = results.every(r => r.passed);

            if (allPassed) {
                this.showSuccess();
                this.time.delayedCall(2000, () => {
                    this.closeChallenge();
                });
            } else {
                this.showTestResults(results, true);
            }
        } catch (error) {
            this.showError(error instanceof Error ? error.message : 'Failed to compile code');
        }
    }

    private showSuccess() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const successOverlay = this.add.container(centerX, centerY);
        successOverlay.setDepth(10000);

        const bg = this.add.rectangle(0, 0, 500, 250, 0x4CAF50);
        bg.setAlpha(0.95);
        successOverlay.add(bg);

        const text = this.add.text(0, -50, '✓ Solution Accepted!', {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        successOverlay.add(text);

        const stats = this.add.text(0, 20,
            `Problem ${this.problem.number}/75 Complete\n` +
            `Earned ${this.problem.reward} points`, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
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

    private skipProblem() {
        const confirmSkip = confirm('Skip this problem?\n\nYou will receive a -100 point penalty.');

        if (confirmSkip) {
            console.log('Problem skipped with -100 points penalty');
            // TODO: Deduct points from player score
            this.closeChallenge();
        }
    }

    private evaluateUserCode(code: string): Function {
        // Create a safe evaluation context
        // Extract the function from the code
        try {
            if (this.currentLanguage === 'python') {
                // For Python, we need to transpile or use a Python runtime
                // Using Brython or Pyodide would be ideal, but for now we'll convert simple Python to JS
                return this.transpilePythonToJS(code);
            } else {
                // JavaScript evaluation
                const evalCode = `${code}\nreturn ${this.problem.functionName};`;
                const fn = new Function(evalCode);
                return fn();
            }
        } catch (error) {
            throw new Error(`Compilation error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private transpilePythonToJS(pythonCode: string): Function {
        try {
            // Simple Python to JavaScript transpilation for basic LeetCode problems
            // This is a basic implementation - for production, use Brython or Pyodide

            // Extract function definition
            const functionMatch = pythonCode.match(/def\s+(\w+)\s*\((.*?)\):/);
            if (!functionMatch) {
                throw new Error('Could not find Python function definition');
            }

            const functionName = functionMatch[1];
            const params = functionMatch[2];

            // Extract function body (everything after the first line, indented)
            const lines = pythonCode.split('\n').slice(1);
            let body = '';

            for (const line of lines) {
                if (line.trim() === '' || line.trim().startsWith('#')) continue;
                // Remove leading indentation (4 spaces or 1 tab)
                const dedented = line.replace(/^(\s{4}|\t)/, '');

                // Basic Python to JS conversions
                let jsLine = dedented
                    .replace(/\bTrue\b/g, 'true')
                    .replace(/\bFalse\b/g, 'false')
                    .replace(/\bNone\b/g, 'null')
                    .replace(/\blen\(/g, '(')  // len(arr) -> arr.length
                    .replace(/\)\.length/g, ').length')
                    .replace(/\brange\(/g, 'Array.from({length: ')
                    .replace(/\band\b/g, '&&')
                    .replace(/\bor\b/g, '||')
                    .replace(/\bnot\b/g, '!')
                    .replace(/\bpass\b/g, '')
                    .replace(/\bdef\b/g, 'function')
                    .replace(/\bself\./g, 'this.');

                // Handle len() properly
                if (jsLine.includes('len(')) {
                    jsLine = jsLine.replace(/len\(([^)]+)\)/g, '$1.length');
                }

                body += jsLine + '\n';
            }

            // Create JavaScript function
            const jsCode = `
                return function ${functionName}(${params}) {
                    ${body}
                };
            `;

            const fn = new Function(jsCode);
            return fn();
        } catch (error) {
            throw new Error(`Python transpilation error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private showTestResults(results: TestResult[], isSubmission: boolean = false) {
        // Create a results overlay
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const resultsOverlay = this.add.container(centerX, centerY);
        resultsOverlay.setDepth(10000);

        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        const allPassed = passedCount === totalCount;

        // Background
        const bgColor = allPassed ? 0x4CAF50 : 0xf44336;
        const bg = this.add.rectangle(0, 0, 600, 400, bgColor);
        bg.setAlpha(0.95);
        resultsOverlay.add(bg);

        // Title
        const title = this.add.text(0, -160,
            isSubmission
                ? (allPassed ? '✓ All Tests Passed!' : '✗ Some Tests Failed')
                : 'Test Results', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        resultsOverlay.add(title);

        // Stats
        const stats = this.add.text(0, -120,
            `${passedCount}/${totalCount} tests passed`, {
            fontSize: '18px',
            color: '#ffffff'
        });
        stats.setOrigin(0.5);
        resultsOverlay.add(stats);

        // Show individual test results (first 5)
        let yOffset = -80;
        const maxDisplay = Math.min(5, results.length);

        for (let i = 0; i < maxDisplay; i++) {
            const result = results[i];
            const status = result.passed ? '✓' : '✗';

            const testText = this.add.text(-250, yOffset,
                `${status} Test ${i + 1}: ${JSON.stringify(result.input)}`, {
                fontSize: '14px',
                color: '#ffffff',
                fontFamily: 'Courier New, monospace'
            });
            testText.setOrigin(0, 0.5);
            resultsOverlay.add(testText);

            if (!result.passed) {
                const errorText = this.add.text(-250, yOffset + 20,
                    result.error
                        ? `Error: ${result.error}`
                        : `Expected: ${JSON.stringify(result.expected)}, Got: ${JSON.stringify(result.actual)}`, {
                    fontSize: '12px',
                    color: '#ffcccc',
                    fontFamily: 'Courier New, monospace',
                    wordWrap: { width: 500 }
                });
                errorText.setOrigin(0, 0);
                resultsOverlay.add(errorText);
                yOffset += 25;
            }

            yOffset += 30;
        }

        if (results.length > maxDisplay) {
            const moreText = this.add.text(0, yOffset,
                `... and ${results.length - maxDisplay} more tests`, {
                fontSize: '14px',
                color: '#cccccc'
            });
            moreText.setOrigin(0.5);
            resultsOverlay.add(moreText);
        }

        // Close button
        const closeBtn = this.add.text(0, 160, 'Close', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        });
        closeBtn.setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            resultsOverlay.destroy();
        });
        resultsOverlay.add(closeBtn);

        // Animation
        resultsOverlay.setScale(0);
        this.tweens.add({
            targets: resultsOverlay,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    private showError(message: string) {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const errorOverlay = this.add.container(centerX, centerY);
        errorOverlay.setDepth(10000);

        const bg = this.add.rectangle(0, 0, 500, 200, 0xf44336);
        bg.setAlpha(0.95);
        errorOverlay.add(bg);

        const title = this.add.text(0, -50, '✗ Compilation Error', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        errorOverlay.add(title);

        const errorText = this.add.text(0, 0, message, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Courier New, monospace',
            wordWrap: { width: 450 },
            align: 'center'
        });
        errorText.setOrigin(0.5);
        errorOverlay.add(errorText);

        const closeBtn = this.add.text(0, 70, 'Close', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 8 }
        });
        closeBtn.setOrigin(0.5);
        closeBtn.setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            errorOverlay.destroy();
        });
        errorOverlay.add(closeBtn);

        // Animation
        errorOverlay.setScale(0);
        this.tweens.add({
            targets: errorOverlay,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    private closeChallenge() {
        // Clean up Monaco editor
        if (this.editor) {
            this.editor.dispose();
        }
        if (this.editorContainer && this.editorContainer.parentNode) {
            this.editorContainer.parentNode.removeChild(this.editorContainer);
        }

        // Resume game scene
        this.scene.resume('Game');
        this.scene.stop();
    }

    private getDifficultyColor(difficulty: number): string {
        if (difficulty <= 3) return '#4CAF50'; // Easy - Green
        if (difficulty <= 6) return '#FFC107'; // Medium - Yellow
        if (difficulty <= 8) return '#FF9800'; // Hard - Orange
        return '#f44336'; // Very Hard - Red
    }
}
