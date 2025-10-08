# Firewall Game Design Document (GDD)

**Version:** 1.0
**Date:** 2025-10-08
**Project Type:** School Project
**Platform:** Web (Desktop)
**Engine:** Phaser 3 + TypeScript

---

## Executive Summary

### Core Concept

**Firewall** is an isometric pixel-art stealth puzzle game where players control a nerdy thief navigating laser-filled museums to steal diamonds. The unique twist: each diamond is protected by a coding challenge that must be solved before the alarm triggers. Success requires both careful movement through laser grids and programming prowess, with difficulty scaling progressively as players collect more diamonds.

### Target Audience

**Primary:** CS students and aspiring developers who enjoy coding challenges and puzzle games

**Secondary:** Gamers interested in learning programming concepts through gameplay

### Platform & Technical Requirements

**Primary Platform:** Web (Desktop focus)
**Engine:** Phaser 3 + TypeScript
**Performance Target:** 60 FPS on modern browsers
**Screen Support:** 1280x720 - 1920x1080

### Unique Selling Points

1. **Educational Gaming Fusion** - Learn coding through engaging gameplay
2. **Progressive Challenge System** - LeetCode-style problems that scale from easy to hard
3. **Dual-Skill Gameplay** - Combines spatial puzzle-solving with algorithmic thinking
4. **Competitive Leaderboard** - Global diamond rankings for competition
5. **Isometric Pixel Aesthetic** - Retro visuals with modern game feel

### Project Scope

**Core Features:**
- 5-10 playable levels
- 10-15 coding challenges (easy to medium difficulty)
- JavaScript code execution
- Basic leaderboard system
- Isometric movement and laser obstacles

**Technical Approach:**
- Phaser 3 for game engine
- Code editor integration (Monaco Editor)
- Basic code validation and execution

---

## Core Gameplay

### Game Pillars

1. **Strategic Navigation** - Every movement through the museum requires planning and spatial awareness to avoid laser detection
2. **Algorithmic Mastery** - Coding challenges are the true test of skill, rewarding clean solutions and efficient thinking
3. **Diamond Tier System** - Color-coded diamonds (White/Blue/Black) clearly communicate difficulty and reward
4. **High-Stakes Tension** - Laser detection triggers quicktime events - fail and lose everything
5. **Thoughtful Problem Solving** - Untimed coding challenges encourage learning over speed, reducing pressure

### Core Gameplay Loop

**Primary Loop (Variable duration per diamond):**

1. **Scout the Room** (10-15s) - Player surveys laser patterns, identifies diamond locations and colors (White/Blue/Black difficulty indicators)
2. **Navigate to Diamond** (20-45s) - Isometric movement through laser grid, choosing path to desired diamond tier
3. **Face Coding Challenge** (Variable, untimed) - Code editor opens with difficulty-appropriate problem:
   - **White Diamond:** Easy problems (arrays, strings, basic loops)
   - **Blue Diamond:** Medium problems (hash maps, two pointers, recursion)
   - **Black Diamond:** Hard problems (dynamic programming, graphs, advanced algorithms)
4. **Collect Diamond** (2s) - Diamond added to categorized inventory (top-right shows: ◇White: X ◆Blue: Y ◆Black: Z)
5. **Continue or Exit** - Player explores for more diamonds or exits to save progress and submit leaderboard score

**Laser Detection Recovery Mechanic:**

When player touches laser:
1. **Quicktime Event Triggers** - Game pauses, shows pattern of key presses (e.g., ←↑→↓ A S D)
2. **Player Must Duplicate** - Limited time window (3-5 seconds) to exactly replicate the pattern
3. **Success:** Player recovers, continues run with all diamonds intact
4. **Failure:** Run ends immediately, all collected diamonds lost, return to main menu

### Win/Loss Conditions

**Victory Conditions:**

- **Complete Run:** Exit the museum with at least 1 diamond, submit score to leaderboard
- **Perfect Heist:** Collect all diamonds in a level without touching lasers
- **High Score:** Leaderboard ranks by weighted score: (White × 1) + (Blue × 3) + (Black × 10)

**Failure States:**

- **Quicktime Failure:** Failed laser recovery QTE results in instant run failure, lose all diamonds
- **Voluntary Restart:** Player can abandon run at any time (no penalty, no score submission)

---

## Game Mechanics

### Primary Mechanics

#### **Isometric Movement & Navigation**

**Description:** Player controls the nerdy thief character in an isometric pixel-art environment, navigating through museum rooms filled with laser grids. Movement is grid-based with smooth transitions between tiles.

**Player Input:**
- Arrow keys or WASD for 8-directional movement (N, NE, E, SE, S, SW, W, NW)
- Movement respects isometric perspective (Up = North-West, Right = North-East)

**System Response:**
- Character animates walking in selected direction
- Collision detection prevents walking through walls/obstacles
- Laser collision triggers quicktime event
- Diamond collision triggers coding challenge interface

**Implementation Notes:**
- Phaser 3 isometric tilemap plugin or custom diamond grid rendering
- Depth sorting for proper layering (character behind/in front of obstacles)
- Smooth tile-to-tile interpolation (not instant teleportation)
- Visual feedback for valid/invalid move destinations

**Performance Consideration:** Isometric depth sorting can be CPU-intensive; pre-calculate depth layers where possible

**Dependencies:** Tilemap system, collision detection, animation system

---

#### **Laser Grid Obstacle System**

**Description:** Static and animated laser beams create spatial puzzles. Lasers are clearly visible with glowing effects. Touching a laser triggers the quicktime recovery mechanic.

**Player Input:**
- Careful movement to avoid laser beams
- Visual observation to identify safe paths and patterns

**System Response:**
- Static lasers: Fixed horizontal/vertical/diagonal beams
- Animated lasers: Rotating, pulsing, or moving patterns with predictable timing
- On collision: Freeze game, trigger quicktime event overlay

**Implementation Notes:**
- Use Phaser geometry objects (lines) with glow shaders for visual appeal
- Hitbox slightly smaller than visual laser for forgiveness
- Multiple laser types: static, rotating (360°), sweeping (back-and-forth), pulsing (on/off)
- Particle effects on laser emitters and endpoints

**Performance Consideration:** Limit glow effects on low-end systems; use simpler sprite-based lasers instead of shaders

**Dependencies:** Collision system, quicktime event system, particle effects

---

#### **Diamond Collection & Difficulty Tiers**

**Description:** Diamonds are placed throughout the level with color-coded difficulty indicators. Each diamond triggers a unique coding challenge when collected.

**Player Input:**
- Walk into diamond sprite to interact
- Choose which diamond tier to pursue based on risk/reward assessment

**System Response:**
- **White Diamond (◇):** Glowing white, easy accessibility, triggers easy coding problem
- **Blue Diamond (◆):** Glowing blue, moderate protection, triggers medium coding problem
- **Black Diamond (◆):** Glowing black, heavily guarded, triggers hard coding problem
- Collected diamonds disappear from level, update inventory counter in top-right

**Implementation Notes:**
- Each diamond has pre-assigned coding problem from problem pool
- Visual distinction: different sprites, particle effects, and glow colors
- Hover/proximity indicator showing diamond color and difficulty label
- Inventory UI: "◇ White: X  ◆ Blue: Y  ◆ Black: Z"

**Performance Consideration:** Sprite animations and particle effects should be optimized for multiple simultaneous diamonds

**Dependencies:** Coding challenge system, inventory UI, problem database

---

#### **Coding Challenge Interface**

**Description:** When player collects a diamond, game pauses and presents a full-screen code editor with a LeetCode-style problem. Player writes JavaScript to solve the problem.

**Player Input:**
- Type JavaScript code in embedded editor
- Click "Submit" to test solution
- Click "Cancel" to forfeit diamond and return to game (no penalty except lost diamond)

**System Response:**
- Parse and validate JavaScript syntax
- Execute code against test cases in sandboxed environment
- **Success:** Display "Solved!" message, add diamond to inventory, resume game
- **Failure:** Show which test cases failed, allow retry (unlimited attempts)
- Display test case results: Input → Expected Output → Your Output

**Implementation Notes:**
- Embed Monaco Editor (desktop)
- Sandboxed execution using Web Workers or isolated-vm
- Problem structure: Title, Description, Constraints, Examples, Test Cases
- Auto-save code between attempts
- Code validation before execution (prevent infinite loops, DOM access, etc.)

**Performance Consideration:** Monaco Editor is heavy; consider CodeMirror or simple textarea for lighter alternative

**Dependencies:** Code editor library, JavaScript interpreter/sandbox, problem database, test case validation system

---

#### **Quicktime Event Recovery System**

**Description:** When player touches a laser, a quicktime event (QTE) appears showing a sequence of key presses. Player must duplicate the pattern within time limit to survive.

**Player Input:**
- Watch displayed pattern (e.g., ← ↑ → ↓ A S D)
- Replicate exact key sequence within 3-5 second window

**System Response:**
- **Success (pattern matched):** Brief "Close Call!" message, resume game with all diamonds intact
- **Failure (wrong key or timeout):** "Caught!" message, run ends, lose all diamonds, return to main menu with score of 0

**Implementation Notes:**
- Pattern generation: Random sequences of 4-8 keys, difficulty scales with number of diamonds held
- Visual feedback: Show keys pressed vs required, highlight correct/incorrect
- Audio cues: Beep on correct key, buzzer on wrong key
- Time pressure indicator (progress bar or countdown)
- Difficulty progression: Early game = 4 keys, late game = 8 keys

**Performance Consideration:** Simple sprite-based UI, minimal animations to maintain 60 FPS

**Dependencies:** Input detection system, UI overlay system, game state management

---

### Controls (Desktop Only)

| Action | Keyboard | Gamepad (Optional) |
| --- | --- | --- |
| Move North | W or ↑ | D-Pad Up |
| Move South | S or ↓ | D-Pad Down |
| Move West | A or ← | D-Pad Left |
| Move East | D or → | D-Pad Right |
| Move Diagonal NE | W+D or ↑+→ | D-Pad diagonal |
| Move Diagonal SE | S+D or ↓+→ | D-Pad diagonal |
| Move Diagonal SW | S+A or ↓+← | D-Pad diagonal |
| Move Diagonal NW | W+A or ↑+← | D-Pad diagonal |
| Pause Menu | ESC or P | Start |
| Submit Code | Ctrl+Enter (in editor) | - |
| Cancel Code Editor | ESC | - |
| QTE Input | Displayed keys | Displayed buttons |

---

## Progression & Balance

### Player Progression

**Progression Type:** Linear level progression with skill-based mastery curve

**Key Milestones:**

1. **Tutorial Museum (Level 1)** - Introduction to movement, lasers, and white diamond coding challenges. Safe environment with simple patterns and guided explanations.

2. **Amateur Heists (Levels 2-3)** - Mix of white and blue diamonds. Laser patterns increase in complexity. Players begin building confidence with medium-difficulty problems.

3. **Professional Thief (Levels 4-6)** - All three diamond tiers available. Complex laser choreography requires planning. Black diamonds offer high-risk, high-reward opportunities.

4. **Master Heist (Levels 7-10)** - Endgame content with dense laser grids, multiple black diamonds, and advanced algorithmic challenges. Designed for players who have mastered both navigation and coding skills.

5. **Leaderboard Legend** - Post-completion pursuit of perfect scores and speedruns. Players replay levels to optimize diamond collection and improve leaderboard ranking.

### Difficulty Curve

**Tutorial Phase (Level 1):** 5-10 minutes
- Wide open spaces with minimal lasers
- Only white diamonds (easy array/string problems)
- Coding problems have hints and example solutions
- No punishment for laser contact (QTE disabled or auto-succeed)

**Early Game (Levels 2-3):** 10-15 minutes per level
- Introduction of blue diamonds (medium problems)
- Static laser patterns with clear safe paths
- QTE patterns are 4-5 keys
- Focus on building confidence

**Mid Game (Levels 4-6):** 15-20 minutes per level
- Black diamonds appear in highly guarded locations
- Animated lasers (rotating, sweeping) require timing
- QTE patterns scale to 6-7 keys
- Multiple paths encourage strategic choice

**Late Game (Levels 7-10):** 20-30 minutes per level
- Dense laser grids with complex overlapping patterns
- High concentration of blue and black diamonds
- QTE patterns reach 8+ keys
- Designed for mastery and perfection

### Economy & Resources

| Resource | How Earned | Purpose | Leaderboard Weight | Notes |
| --- | --- | --- | --- | --- |
| **White Diamond (◇)** | Solve easy coding problem | Score points, build confidence | 1 point | Array, string, basic loop problems |
| **Blue Diamond (◆)** | Solve medium coding problem | Higher score, skill demonstration | 3 points | Hash maps, two pointers, recursion |
| **Black Diamond (◆)** | Solve hard coding problem | Maximum score, prestige | 10 points | Dynamic programming, graphs, advanced |
| **Completion Time** | Measured from level start to exit | Tiebreaker on leaderboard | Tiebreaker only | Encourages efficiency without rushing code quality |
| **Perfect Run Bonus** | Complete level without touching lasers | Leaderboard badge/multiplier | 1.5× multiplier | Optional challenge for skilled players |

**Leaderboard Scoring Formula:**

```
Base Score = (White × 1) + (Blue × 3) + (Black × 10)
Final Score = Base Score × Perfect Run Multiplier
```

**Example Scores:**
- 10 White + 0 Blue + 0 Black = 10 points
- 3 White + 4 Blue + 1 Black = 3 + 12 + 10 = 25 points
- 5 White + 5 Blue + 3 Black + Perfect Run = (5 + 15 + 30) × 1.5 = 75 points

---

## Level Design Framework

### Level Types

#### **Tutorial Museum - "The Training Vault"**

**Purpose:** Teach core mechanics in safe, guided environment without punishment

**Duration:** 5-10 minutes (first-time playthrough)

**Key Elements:**
- Isometric grid movement tutorial with visual guides
- 3-5 white diamonds only
- Static lasers with obvious safe paths
- First coding challenge includes hints and example code
- QTE disabled or auto-succeeds

**Difficulty:** Minimal (Learning phase)

**Structure Template:**
- **Introduction:** Text overlays explain controls, show character walking animation
- **Challenge:** Navigate simple L-shaped path with 2 static lasers, collect first white diamond, solve "Two Sum" or similar easy array problem
- **Resolution:** Exit door unlocks after collecting at least 1 diamond, congratulatory message encourages exploring for more

---

#### **Standard Museum - "Gallery Heist"**

**Purpose:** Core gameplay loop with balanced mix of all diamond tiers and moderate laser complexity

**Duration:** 15-20 minutes (optimal playthrough)

**Key Elements:**
- 5-7 white diamonds (easy access)
- 3-4 blue diamonds (moderate laser protection)
- 1-2 black diamonds (heavily guarded, risky paths)
- Mix of static and animated lasers (rotating, sweeping)
- Multiple paths allow player choice

**Difficulty:** Moderate to Hard (scales with diamond choice)

**Structure Template:**
- **Introduction:** Player enters museum foyer with clear view of room layout, can survey diamond locations
- **Challenge:** Navigate through increasingly complex laser patterns; choose risk vs reward (safe whites or risky blacks)
- **Resolution:** Reach exit with collected diamonds; leaderboard submission screen shows score breakdown

---

#### **Endgame Gauntlet - "The Vault of Algorithms"**

**Purpose:** Ultimate test of both navigation mastery and coding expertise

**Duration:** 25-30 minutes (expert playthrough)

**Key Elements:**
- 2-3 white diamonds (minimal)
- 6-8 blue diamonds (standard difficulty)
- 4-5 black diamonds (primary focus)
- Dense, overlapping laser grids requiring precise timing
- Animated lasers with complex choreography
- Optional "perfect path" for no-laser runs

**Difficulty:** Expert (designed for mastery)

**Structure Template:**
- **Introduction:** Imposing vault entrance with visible high-value black diamonds behind complex laser maze
- **Challenge:** Requires planning and execution; memorizing laser patterns; solving advanced DP/graph problems
- **Resolution:** Hall of Fame screen for perfect runs; encouragement to optimize and improve score

---

### Level Progression

**World Structure:** Linear progression (Level 1 → Level 2 → ... → Level 10)

**Total Levels:** 10 levels (1 tutorial + 6 standard + 3 endgame)

**Unlock Pattern:** Sequential unlock - complete Level N to unlock Level N+1

**Level Breakdown:**
1. **Level 1:** Tutorial Museum (training wheels)
2. **Levels 2-3:** Early Standard Museums (white + blue diamonds, simple patterns)
3. **Levels 4-7:** Mid-Late Standard Museums (all tiers, increasing complexity)
4. **Levels 8-10:** Endgame Gauntlets (black diamond focus, expert challenges)

**Replayability:**
- All levels remain accessible after completion
- Leaderboards encourage replaying for higher scores
- Perfect run challenges add optional mastery goals

---

**Design Guidelines for Level Creation:**

**Spatial Layout:**
- Isometric grid size: 20×20 to 30×30 tiles
- Entry point always clearly marked (green tile or visual indicator)
- Exit point visible from entry (encourages strategic planning)
- Diamond placement follows "easy outer, hard inner" rule (white diamonds on periphery, black diamonds in center)

**Laser Patterns:**
- **Early Game:** 3-5 static lasers, clear gaps
- **Mid Game:** 8-12 lasers mix (60% static, 40% animated)
- **Late Game:** 15-20 lasers (40% static, 60% animated), overlapping patterns

**Diamond Distribution per Level:**
- **Tutorial:** 3-5 white
- **Early Standard:** 5 white, 3 blue, 0-1 black
- **Mid Standard:** 5 white, 4 blue, 2 black
- **Late Standard:** 4 white, 5 blue, 3 black
- **Endgame:** 2 white, 6 blue, 4-5 black

**Coding Problem Assignment:**
- Each diamond has fixed problem (consistency for leaderboards)
- White: Arrays, strings, basic iteration (Two Sum, Reverse String, FizzBuzz)
- Blue: Hash maps, two pointers, recursion (Valid Parentheses, Longest Substring, Binary Search)
- Black: DP, graphs, advanced algorithms (Longest Palindromic Substring, Island Count, Knapsack)

---

## Technical Specifications

### Performance Requirements

**Frame Rate:** 60 FPS sustained on desktop browsers (minimum 45 FPS acceptable during heavy particle effects)

**Memory Usage:** <512 MB RAM allocation

**Load Times:**
- Initial load: <5 seconds (including Phaser engine + Monaco Editor)
- Level transitions: <2 seconds
- Code editor open: <500ms

**Browser Compatibility:**
- Chrome 90+ (primary target)
- Firefox 88+
- Safari 14+
- Edge 90+

### Platform Specific

**Desktop:**

- **Resolution Support:** 1280x720 (minimum) - 1920x1080 (optimal) - 2560x1440 (supported)
- **Input:** Keyboard (primary), Gamepad (optional support)
- **Browser:** Modern evergreen browsers with WebGL support
- **Aspect Ratio:** 16:9 optimized, 16:10 compatible

**Display Settings:**
- Fullscreen mode available
- Windowed mode default
- Responsive canvas scaling (maintains aspect ratio)

### Asset Requirements

**Visual Assets:**

**Art Style:** Pixel art with isometric perspective, retro-inspired with modern clarity

**Color Palette:**
- Museum environment: Muted grays, browns, marble whites (sophisticated museum aesthetic)
- Lasers: Bright reds, oranges (high visibility, danger indication)
- Diamonds: White (bright white glow), Blue (cyan/sapphire glow), Black (obsidian with purple glow)
- Character: Nerdy thief with glasses, hoodie, backpack (relatable CS student aesthetic)

**Sprite Specifications:**
- Character sprite: 32×32 pixels, 8-directional walk cycle (8 frames per direction)
- Diamond sprites: 16×16 pixels, idle glow animation (4 frames)
- Tile size: 64×32 pixels (isometric diamond grid)
- UI elements: Vector-based where possible for crisp scaling

**Animation Requirements:**
- Character walk: 8 FPS animation speed (smooth but retro feel)
- Laser effects: Particle emitters with 2-3 particle types
- Diamond collection: 10-frame "pop" effect with score popup
- QTE interface: Simple slide-in animation (300ms)

**Visual Effects:**
- Glow shaders for lasers and diamonds (WebGL)
- Particle trails for character movement (optional polish)
- Screen shake on laser collision (subtle, 2-3 frames)

---

**Audio Assets:**

**Music Style:** Chiptune/synthwave hybrid - upbeat but tense, reinforces "heist" atmosphere

**Music Tracks:**
- Main menu theme (looping, 1-2 minutes)
- Gameplay theme (looping, 2-3 minutes, layered for intensity)
- Victory jingle (5-10 seconds)
- Failure jingle (3-5 seconds)

**Sound Effects:**
- Footstep sounds (soft, museum-appropriate)
- Laser hum (ambient loop when near lasers)
- Laser collision alarm (sharp, attention-grabbing)
- Diamond collection chime (satisfying, tier-specific pitch)
- Code submit button click
- QTE key press (correct/incorrect feedback)
- UI navigation sounds

**Voice Acting:** None (text-only dialogue/instructions)

---

## Technical Architecture Requirements

### Engine Configuration

**Phaser 3 Setup:**

- **TypeScript:** Strict mode enabled for type safety
- **Physics:** Arcade Physics (lightweight, sufficient for 2D collision detection)
- **Renderer:** WebGL with automatic Canvas fallback for older browsers
- **Scale Mode:** FIT (maintains aspect ratio, scales to window size)

**Phaser Configuration Example:**
```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [PreloadScene, MenuScene, GameScene, CodeEditorScene]
};
```

### Code Architecture

**Required Systems:**

**Scene Management:**
- PreloadScene: Asset loading with progress bar
- MenuScene: Main menu, level selection, leaderboard
- GameScene: Core gameplay (isometric movement, lasers, diamonds)
- CodeEditorScene: Overlay scene for coding challenges
- QTEScene: Overlay scene for quicktime events

**State Management:**
- Player inventory (white/blue/black diamond counts)
- Current level progress
- Leaderboard data (local + server sync)
- Settings (audio volume, controls)
- Persistent data via LocalStorage

**Asset Loading:**
- Preload all sprites, tilemaps, and audio for current level
- Lazy load Monaco Editor on first code challenge
- Level data loaded from JSON files

**Save/Load System:**
- LocalStorage for player progress (unlocked levels, high scores)
- Optional backend integration for global leaderboard (REST API)

**Input Management:**
- Keyboard input handler with key mapping
- Gamepad support (optional stretch goal)
- Input context switching (game vs code editor vs QTE)

**Audio System:**
- Background music manager (loop, volume control)
- Sound effect pool (prevent audio clipping)
- Mute/unmute toggle

**Performance Monitoring:**
- FPS counter (debug mode)
- Memory profiler (development only)

### Data Management

**Save Data Structure:**
```typescript
interface SaveData {
  playerName: string;
  unlockedLevels: number; // 1-10
  levelScores: {
    levelId: number;
    whiteCount: number;
    blueCount: number;
    blackCount: number;
    perfectRun: boolean;
    completionTime: number;
    totalScore: number;
  }[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    controlScheme: 'WASD' | 'Arrows';
  };
}
```

**Level Data Structure:**
```typescript
interface LevelData {
  id: number;
  name: string;
  tilemap: string; // Path to Tiled JSON
  diamonds: {
    id: string;
    tier: 'white' | 'blue' | 'black';
    position: { x: number; y: number };
    problemId: string;
  }[];
  lasers: {
    type: 'static' | 'rotating' | 'sweeping';
    position: { x: number; y: number };
    rotation?: number;
    speed?: number;
  }[];
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
}
```

**Coding Problem Data:**
```typescript
interface CodingProblem {
  id: string;
  tier: 'white' | 'blue' | 'black';
  title: string;
  description: string;
  examples: { input: string; output: string }[];
  constraints: string[];
  testCases: { input: any; expectedOutput: any }[];
  starterCode: string;
  hints?: string[];
}
```

---

## Development Phases

### Phase 1: Core Systems (3-4 weeks)

#### Epic: Foundation

- Set up Phaser 3 + TypeScript project with build pipeline (Webpack/Vite)
- Configure ESLint, Prettier for code quality
- Implement basic scene management (Preload, Menu, Game scenes)
- Create asset loading system with progress bar
- Set up LocalStorage save/load system
- Establish git repository and version control workflow

#### Epic: Core Mechanics

- Implement isometric grid system and tile rendering
- Build player character controller (8-directional movement)
- Create basic collision detection system
- Develop camera system with isometric perspective
- Implement player sprite animations (walk cycles)
- Create basic UI framework (HUD, inventory display)

**Deliverable:** Playable character that can move on isometric grid with basic collision

---

### Phase 2: Gameplay Features (4-5 weeks)

#### Epic: Game Systems

- **Laser System Implementation:**
  - Static laser rendering with glow effects
  - Animated lasers (rotating, sweeping patterns)
  - Laser-player collision detection
  - Visual feedback on collision

- **Diamond System Implementation:**
  - Diamond sprite rendering (white/blue/black tiers)
  - Diamond collection trigger
  - Inventory tracking and UI updates
  - Diamond particle effects

- **QTE System Implementation:**
  - Pattern generation algorithm
  - Input detection and validation
  - Timer system with visual feedback
  - Success/failure outcomes

#### Epic: Coding Challenge Integration

- **Code Editor Integration:**
  - Integrate Monaco Editor
  - Create overlay scene for code challenges
  - Implement syntax highlighting and autocomplete
  - Build submit/cancel UI

- **Code Execution Engine:**
  - Set up Web Worker for sandboxed execution
  - Implement timeout protection (prevent infinite loops)
  - Build test case validation system
  - Create feedback UI (test results, error messages)

- **Problem Database:**
  - Create JSON structure for coding problems
  - Implement 10-15 initial problems (5 white, 7 blue, 3 black)
  - Write test cases for each problem
  - Add hints and example solutions

**Deliverable:** Full gameplay loop - navigate, collect diamond, solve code challenge, collect diamond

---

### Phase 3: Content Creation (2-3 weeks)

#### Epic: Level Design

- Design and build 10 levels using Tiled map editor
- Create level progression JSON data
- Implement level selection UI
- Build level unlock system
- Playtest and balance laser difficulty
- Assign coding problems to each diamond

#### Epic: Visual & Audio Polish

- Create final character sprite sheets (all 8 directions)
- Design and implement particle effects
- Add screen shake and juice effects
- Integrate background music (3-4 tracks)
- Implement sound effects for all interactions
- Create menu backgrounds and UI art

**Deliverable:** Complete 10-level game with full audiovisual polish

---

### Phase 4: Polish & Optimization (2 weeks)

#### Epic: Performance Optimization

- Profile and optimize rendering performance
- Reduce memory footprint (asset compression)
- Optimize code execution sandbox
- Test on target browsers (Chrome, Firefox, Safari)
- Fix performance bottlenecks to achieve 60 FPS

#### Epic: User Experience & Quality of Life

- Add pause menu with settings
- Implement audio volume controls
- Create tutorial tooltips and hints
- Add level restart functionality
- Build leaderboard UI (local scores)
- Polish transitions and animations
- Add accessibility features (colorblind mode, key rebinding)

#### Epic: Testing & Bug Fixes

- Conduct playtesting sessions with peers
- Fix critical bugs and edge cases
- Balance coding problem difficulty based on feedback
- Ensure all levels are completable
- Test save/load functionality thoroughly

**Deliverable:** Polished, bug-free game ready for submission

---

### Phase 5: Deployment & Documentation (1 week)

#### Epic: Deployment

- Build production bundle (minified, optimized)
- Deploy to web hosting (GitHub Pages, Netlify, or Vercel)
- Test deployed version on multiple browsers
- Set up analytics (optional - Google Analytics for playtime tracking)

#### Epic: Project Documentation

- Write project README with setup instructions
- Document code architecture and key systems
- Create gameplay tutorial/guide
- Prepare project presentation materials
- Record gameplay demo video

**Deliverable:** Deployed game with complete documentation for academic submission

---

## Development Timeline Summary

| Phase | Duration | Key Milestones |
| --- | --- | --- |
| **Phase 1: Core Systems** | 3-4 weeks | Playable character on isometric grid |
| **Phase 2: Gameplay Features** | 4-5 weeks | Complete gameplay loop working |
| **Phase 3: Content Creation** | 2-3 weeks | All 10 levels playable |
| **Phase 4: Polish & Optimization** | 2 weeks | Performance targets met, bug-free |
| **Phase 5: Deployment** | 1 week | Live deployment + documentation |
| **TOTAL** | **12-15 weeks** | **~3-4 months** |

---

**Critical Path Items:**
1. Isometric rendering system (blocks everything)
2. Code editor integration (core mechanic)
3. Code sandboxing (security critical)
4. Level data structure (enables content creation)

**Parallel Work Opportunities:**
- Art assets can be created while core systems are built
- Audio can be sourced/created during Phase 2-3
- Level design can begin once grid system is complete
- Problem database can be populated independently

**Risk Mitigation:**
- **If Monaco Editor proves too complex:** Fall back to simple textarea with basic syntax highlighting
- **If isometric rendering is too difficult:** Pivot to top-down 2D perspective
- **If 10 levels is too ambitious:** MVP is 5 levels (1 tutorial + 4 progression)

---

## Success Metrics

### Technical Metrics

- **Frame Rate:** Sustained 60 FPS on desktop browsers (Chrome, Firefox, Safari) at 1920×1080
- **Load Time:** Initial game load <5 seconds on broadband connection
- **Level Load Time:** <2 seconds between level transitions
- **Crash Rate:** <1% of play sessions (target: zero critical bugs)
- **Memory Usage:** <512 MB RAM allocation
- **Browser Compatibility:** 100% functionality on Chrome 90+, Firefox 88+, Safari 14+

### Gameplay Metrics

- **Tutorial Completion:** 80%+ of players complete tutorial level (industry benchmark: 40-60%)
- **Level 1-5 Completion:** 60%+ of players reach mid-game content
- **Level 10 Completion:** 20%+ of players complete all content (indicates good difficulty balance)
- **Average Session Length:** 20-30 minutes per play session
- **Code Challenge Success Rate:**
  - White diamonds: 85%+ solve rate (should feel achievable)
  - Blue diamonds: 50-60% solve rate (moderate challenge)
  - Black diamonds: 20-30% solve rate (hard but fair)

### Educational Outcomes

- **Skill Demonstration:** Players successfully apply learned algorithms in later challenges
- **Problem Diversity:** Players attempt problems across all three tiers (not just easy)
- **Persistence:** Average 2-3 retry attempts before solving medium/hard problems (shows engagement, not frustration)

### Project Success (Academic Context)

- **Code Quality:** Clean TypeScript with <10 ESLint warnings, well-documented
- **Feature Completeness:** All core mechanics implemented and functional
- **Playability:** Game is completable from start to finish without critical bugs
- **Presentation:** Polished demo for academic presentation/showcase

---

## Appendices

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-08 | 1.0 | Initial GDD created with Alex (Game Designer) | Team |
| TBD | 1.1 | Post-playtesting balance adjustments | Team |
| TBD | 2.0 | Final version with implementation notes | Team |

### References

**Game Design Inspiration:**
- *Portal* - Tutorial design and progressive difficulty
- *The Witness* - Puzzle design philosophy
- *Untitled Goose Game* - Approachable stealth mechanics
- *Baba Is You* - Educational puzzle game design

**Technical References:**
- Phaser 3 Documentation: https://photonstorm.github.io/phaser3-docs/
- Tiled Map Editor: https://doc.mapeditor.org/
- Monaco Editor Integration: https://microsoft.github.io/monaco-editor/
- LeetCode Problem Archive: https://leetcode.com/problemset/

**Educational Game Design:**
- *CodeCombat* - Coding education through gameplay
- *Human Resource Machine* - Programming puzzle mechanics
- *Hacknet* - Hacking simulation aesthetics

**Isometric Game References:**
- *Hades* - Isometric rendering techniques
- *Transistor* - Pixel art isometric style
- *Into the Breach* - Grid-based isometric gameplay

---

**End of Document**
