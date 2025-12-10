# Firewall: Endless Runner - Game Design Document (GDD)

**Version:** 2.0
**Date:** 2025-10-19
**Project Type:** School Project - Educational Game
**Platform:** Web (Desktop)
**Engine:** Phaser 3 + TypeScript

---

## Executive Summary

### Core Concept

**Firewall** is a 2D endless runner where players control a nerdy hacker sprinting through an infinite digital corridor, dodging laser security systems and collecting valuable data diamonds. The unique twist: each diamond collected triggers a real coding challenge that must be solved to secure the score. Fail to dodge a laser, and you'll face a quick-time event to disarm the alarm—or lose everything. It's Jetpack Joyride meets LeetCode in a high-stakes physical + cybersecurity heist.

### Target Audience

**Primary:** CS students and aspiring developers (18-25) who enjoy skill-based games and want to practice coding in an engaging format

**Secondary:** Casual gamers interested in learning programming concepts through fast-paced, addictive gameplay

### Platform & Technical Requirements

**Primary Platform:** Web (Desktop focus)
**Engine:** Phaser 3 + TypeScript
**Performance Target:** 60 FPS on modern browsers
**Screen Support:** 1280x720 - 1920x1080 (16:9 optimized)

### Unique Selling Points

1. **Infinite Replayability** - Procedurally generated obstacle patterns ensure every run feels fresh and challenging
2. **Code-to-Play Loop** - Real coding challenges integrated seamlessly into fast-paced runner mechanics
3. **High-Stakes Tension** - Quick-time events turn mistakes into dramatic recovery moments, not instant failures
4. **Competitive Leaderboards** - Global rankings by diamonds collected and distance traveled drive competition
5. **Educational Gaming Fusion** - Learn algorithms and data structures while experiencing genuine arcade thrills

### Project Scope

**Core Features:**
- Endless procedural corridor generation
- Auto-run with jump/slide mechanics
- 3 tiers of coding challenges (Easy/Medium/Hard linked to diamond colors)x
- JavaScript code execution with Monaco Editor integration
- Quick-time event recovery system for failed obstacles
- Global leaderboard (distance + weighted diamond score)
- Progressive difficulty scaling (speed/obstacle density increases)

**Technical Approach:**
- Phaser 3 Arcade Physics for collision detection
- Procedural obstacle spawning system
- Code editor integration (Monaco Editor)
- Sandboxed JavaScript execution (Web Workers)

---

## Core Gameplay

### Game Pillars

1. **Speed & Reflexes** - Fast auto-scrolling demands split-second timing for jumping and sliding through laser patterns
2. **Algorithmic Mastery** - Coding challenges pause the action, rewarding clean solutions with continued progress
3. **Risk vs Reward** - Diamond tiers (White/Blue/Black) offer different point values; harder challenges = bigger scores
4. **Second Chances** - Quick-time events provide dramatic recovery opportunities, keeping players in flow state longer
5. **Endless Pursuit** - No finish line—only personal bests and leaderboard domination drive replayability

### Core Gameplay Loop

**Primary Loop (Variable duration):**

1. **Auto-Run Through Corridor** (Continuous) - Player character sprints forward at constant speed, camera follows
2. **Dodge Laser Obstacles** (1-3s reaction windows) - Jump over low lasers, slide under high lasers using precise timing
3. **Collect Diamond** (Instant) - Run into floating diamond to trigger coding challenge; game pauses
4. **Solve Coding Challenge** (Untimed) - Code editor appears with difficulty-appropriate problem; player writes JavaScript solution
5. **Resume Running** (Instant) - Diamond secured to score, speed gradually increases, new obstacles spawn
6. **Laser Collision → QTE** (3-5s window) - If player hits laser, quick-time event triggers; match key sequence to disarm alarm or fail and lose run

**Recovery Mechanic:**

When player collides with laser:
1. Game pauses, alarm animation plays
2. Random key sequence displays (e.g., ← ↑ → A S D)
3. Player has 3-5 seconds to replicate pattern exactly
4. **Success:** Brief invincibility, continue run with all diamonds intact
5. **Failure:** Run ends, final score calculated, return to main menu

### Win/Loss Conditions

**Victory Conditions:**

- **Endless Mode:** No true "win"—success measured by leaderboard ranking
- **High Score Run:** Achieve personal best distance or weighted diamond score
- **Milestone Achievements:** Reach distance thresholds (e.g., 1000m, 5000m, 10000m)

**Failure States:**

- **QTE Failure:** Failed to disarm alarm after laser collision—run ends immediately
- **Fall Off Screen:** Player falls below screen bounds (rare edge case)
- **Voluntary Quit:** Player can pause and abandon run (score not submitted)

---

## Game Mechanics

### Primary Mechanics

#### **Auto-Scrolling Runner**

**Description:** The player character automatically runs forward at increasing speed. The camera follows, and the environment scrolls continuously from right to left. Player has no control over horizontal movement—only vertical (jump/slide).

**Player Input:**
- No horizontal movement control (auto-scroll)
- Vertical actions only (jump/slide)
- Passive collection of diamonds by collision

**System Response:**
- Constant forward velocity (increases over time/distance)
- Parallax scrolling background for depth perception
- Speed multiplier increases every 500m traveled
- Obstacle spawn rate scales with speed

**Implementation Notes:**
- Use Phaser's built-in velocity system for smooth scrolling
- Camera follows player with fixed X offset
- Spawn obstacles at edge of screen based on timer + speed
- Parallax layers: background (0.3x), midground (0.6x), foreground (1x)

**Performance Consideration:** Object pooling for obstacles and diamonds to prevent garbage collection lag

**Dependencies:** Obstacle spawning system, collision detection, camera system

---

#### **Jump & Slide Mechanics**

**Description:** Player can jump over low lasers or slide under high lasers. Timing is critical—misjudged inputs result in collision and trigger QTE recovery system.

**Player Input:**
- **SPACE / W / ↑** - Jump (vertical leap with arc)
- **SHIFT / S / ↓** - Slide (crouch/duck motion)
- Single press = full action (not hold-based)

**System Response:**
- **Jump:** Player sprite launches upward, follows parabolic arc, lands after ~0.8 seconds
- **Slide:** Player hitbox shrinks vertically for ~0.6 seconds, character sprite animates crouch
- Cannot jump while sliding or slide while jumping (actions lock until complete)
- Collision detection checks overlap between player hitbox and laser hitboxes

**Implementation Notes:**
- Use Arcade Physics for jump gravity and velocity
- Slide implemented as temporary hitbox resize + animation
- Coyote time (0.1s grace period after leaving ground) for forgiving jump timing
- Buffer input (0.15s) to queue next action during current action

**Performance Consideration:** Optimize hitbox calculations; use simple rectangles, not complex polygons

**Dependencies:** Animation system, collision detection, input manager

---

#### **Diamond Collection & Coding Challenges**

**Description:** Diamonds spawn in the corridor at varying heights and positions. Collecting a diamond pauses the game and presents a LeetCode-style coding challenge. Solving the challenge adds the diamond to the player's score.

**Player Input:**
- Run into diamond sprite to trigger collection
- Choose diamond tier strategically (risky placement = harder problems)

**System Response:**
- **White Diamond (◇):** Easy coding problem (arrays, strings, basic loops) - 1 point
- **Blue Diamond (◆):** Medium coding problem (hash maps, two pointers, recursion) - 3 points
- **Black Diamond (◆):** Hard coding problem (DP, graphs, advanced algorithms) - 10 points
- Game pauses when diamond collected
- Monaco Editor overlay appears with problem description, starter code, test cases
- Player writes JavaScript solution, submits for validation
- **Success:** Diamond added to score, game resumes at same speed/position
- **Failure:** Can retry unlimited times or forfeit diamond and resume
- **Forfeit:** Resume run without diamond (no penalty except lost points)

**Implementation Notes:**
- Diamonds spawn on predictable paths (high, mid, low) requiring jump/normal/slide to reach
- Each diamond has pre-assigned problem from problem pool (consistency for fairness)
- Visual distinction: different colors, particle effects, glow animations
- Code editor: Monaco Editor (desktop) with JavaScript syntax highlighting
- Sandboxed execution: Web Workers with timeout protection (prevent infinite loops)
- Test cases run automatically on submit; show pass/fail for each case

**Performance Consideration:** Lazy-load Monaco Editor on first diamond collected (heavy library)

**Dependencies:** Code editor library, JavaScript sandbox, problem database, test case validation system

---

#### **Laser Obstacle System**

**Description:** Laser beams appear as horizontal barriers at varying heights. Players must jump over low lasers or slide under high lasers. Collision triggers the quick-time event system.

**Player Input:**
- Visual observation to identify laser type (low vs high)
- Precise timing to execute jump or slide

**System Response:**
- **Low Laser:** Horizontal beam at ground level; requires jump to clear
- **High Laser:** Horizontal beam at head height; requires slide to duck under
- **Mid Laser:** No such thing—always clearly low or high for binary decision-making
- Lasers glow with red particle effects for high visibility
- Collision detection checks overlap between player and laser hitboxes
- On collision: Trigger QTE system (do not end run immediately)

**Implementation Notes:**
- Lasers spawn from obstacle pool at screen edge
- Move leftward at same speed as background scroll (creates illusion of player moving forward)
- Destroy lasers when they exit screen left (return to pool)
- Laser patterns: single lasers, double lasers (jump-slide combo), triple lasers (complex timing)
- Difficulty scaling: Increase laser density and pattern complexity over time

**Performance Consideration:** Limit active lasers on screen to 5-8 max; use object pooling

**Dependencies:** Collision system, QTE system, particle effects, obstacle spawner

---

#### **Quick-Time Event (QTE) Recovery**

**Description:** When player collides with a laser, instead of instant game over, a QTE appears. Player must replicate a displayed key sequence within 3-5 seconds to disarm the alarm and continue the run. Failure ends the game.

**Player Input:**
- Watch displayed key sequence (e.g., ← ↑ → ↓ A S)
- Replicate exact sequence within time limit

**System Response:**
- **Success:** "Alarm Disarmed!" message, brief invincibility (2s), resume run with all diamonds intact
- **Failure:** "Security Breach!" message, run ends, calculate final score, show leaderboard submission
- Visual feedback: Highlight correct/incorrect keys as player types
- Audio cues: Beep on correct key, buzzer on wrong key
- Timer countdown with progress bar

**Implementation Notes:**
- Pattern generation: 4-8 random keys (arrow keys + A/S/D/F)
- Difficulty scaling: Pattern length increases with player score (more diamonds = harder QTE)
- Early game: 4 keys, late game: 8 keys
- Input validation: Exact sequence match required; wrong key = instant fail
- Time pressure: 5 seconds early game, scales down to 3 seconds late game

**Performance Consideration:** Simple overlay UI; pause all background updates during QTE

**Dependencies:** Input detection system, UI overlay, game state pause/resume

---

### Controls (Desktop Only)

| Action | Keyboard | Notes |
| --- | --- | --- |
| Jump | SPACE / W / ↑ | Single press, cannot hold |
| Slide | SHIFT / S / ↓ | Single press, cannot hold |
| Pause Menu | ESC / P | Pause game, access settings |
| Submit Code | Ctrl+Enter (in editor) | Validate solution |
| Cancel Code Editor | ESC (in editor) | Forfeit diamond, resume run |
| QTE Input | Displayed keys | Must match exact sequence |

---

## Progression & Balance

### Player Progression

**Progression Type:** Endless with milestone-based unlocks (cosmetic skins, achievements)

**Key Milestones:**

1. **First Run (0-500m)** - Tutorial tooltips explain jump/slide, first white diamond introduces coding challenges, forgiving QTE patterns
2. **Intermediate Runs (500-2000m)** - Speed increases noticeably, blue diamonds appear, laser patterns become complex (jump-slide combos)
3. **Advanced Runs (2000m+)** - Black diamonds spawn, maximum speed reached, dense laser grids require perfect timing, QTE patterns at 7-8 keys
4. **Leaderboard Legend (Top 10%)** - Elite players optimize diamond collection routes, prioritize high-value blacks, master QTE under pressure
5. **Achievement Hunter** - Optional goals (e.g., "Collect 10 Black Diamonds in One Run", "Travel 10,000m", "Solve 50 Coding Challenges")

### Difficulty Curve

**Tutorial Phase (First 30 seconds):**
- Speed: 200 pixels/second (slow)
- Lasers: Single low lasers, wide gaps (3-4 seconds between)
- Diamonds: White only, easy placement
- QTE: 4 keys, 5 second timer, auto-succeed first time

**Early Game (30s - 2 minutes / 0-500m):**
- Speed: 200-300 pixels/second (gradual increase)
- Lasers: Mix of single low and high, occasional doubles
- Diamonds: White and blue, moderate placement
- QTE: 5 keys, 4.5 second timer

**Mid Game (2-5 minutes / 500-2000m):**
- Speed: 300-400 pixels/second
- Lasers: Double and triple patterns, tighter spacing (1-2 seconds between)
- Diamonds: All tiers available, black diamonds in risky positions
- QTE: 6-7 keys, 4 second timer

**Late Game (5+ minutes / 2000m+):**
- Speed: 400-500 pixels/second (capped)
- Lasers: Dense grids, complex patterns, minimal gaps (0.5-1 second between)
- Diamonds: Black diamond focus, extreme placement challenges
- QTE: 7-8 keys, 3 second timer

### Economy & Resources

| Resource | How Earned | Purpose | Leaderboard Weight | Notes |
| --- | --- | --- | --- | --- |
| **White Diamond (◇)** | Solve easy coding problem | Score points, build confidence | 1 point | Array, string, basic loop problems |
| **Blue Diamond (◆)** | Solve medium coding problem | Higher score, skill demonstration | 3 points | Hash maps, two pointers, recursion |
| **Black Diamond (◆)** | Solve hard coding problem | Maximum score, prestige | 10 points | Dynamic programming, graphs, advanced |
| **Distance Traveled (m)** | Continuous forward movement | Leaderboard ranking (tiebreaker) | Secondary metric | Measures endurance and consistency |
| **Run Duration (seconds)** | Survive without failing QTE | Achievement tracking | Tertiary metric | Used for speedrun challenges |

**Leaderboard Scoring Formula:**

```
Primary Score = (White × 1) + (Blue × 3) + (Black × 10)
Tiebreaker 1 = Distance Traveled (meters)
Tiebreaker 2 = Run Duration (seconds)
```

**Example Scores:**
- 10 White + 500m = 10 points, 500m
- 3 White + 4 Blue + 1 Black + 1200m = 3 + 12 + 10 = 25 points, 1200m
- 5 White + 5 Blue + 3 Black + 3500m = 5 + 15 + 30 = 50 points, 3500m

---

## Level Design Framework

### Procedural Generation System

**Purpose:** Create infinite, fair, and progressively challenging obstacle layouts

**Generation Rules:**

**Obstacle Spawning:**
- Spawn timer: Based on speed (faster = more frequent)
- Minimum gap between obstacles: 2 seconds at base speed, 0.8 seconds at max speed
- Laser types: 60% low (jump required), 40% high (slide required)
- Pattern types:
  - Single: 50% chance (one laser)
  - Double: 30% chance (jump → slide or slide → jump)
  - Triple: 20% chance (complex combo; only spawns after 1000m)

**Diamond Spawning:**
- White diamonds: Every 200-300m
- Blue diamonds: Every 400-600m
- Black diamonds: Every 800-1200m
- Placement tiers:
  - **Safe:** Diamond on ground level, no obstacles nearby
  - **Moderate:** Diamond requires jump or slide to reach, lasers before/after
  - **Risky:** Diamond between tight laser pattern, demands precise timing

**Difficulty Scaling:**
- Speed multiplier increases by 0.1x every 500m (caps at 2.5x base speed)
- Laser density increases: +10% spawn rate every 1000m
- Pattern complexity increases: More doubles/triples after 1000m
- QTE difficulty increases: +1 key every 5 diamonds collected (caps at 8 keys)

**Fairness Guarantees:**
- Always solvable: No patterns spawn that require impossible timing
- Reaction time: Minimum 0.6 seconds to react to new obstacle on screen
- No double-punish: After QTE recovery, 3 seconds of guaranteed safe corridor

---

## Technical Specifications

### Performance Requirements

**Frame Rate:** 60 FPS sustained on desktop browsers (minimum 45 FPS acceptable during particle-heavy moments)

**Memory Usage:** <256 MB RAM allocation

**Load Times:**
- Initial load: <3 seconds (Phaser engine + Monaco Editor lazy-loaded)
- Run restart: <1 second (reuse pooled objects)
- Code editor open: <500ms (after first lazy-load)

**Browser Compatibility:**
- Chrome 90+ (primary target)
- Firefox 88+
- Safari 14+
- Edge 90+

### Platform Specific

**Desktop:**

- **Resolution Support:** 1280x720 (minimum) - 1920x1080 (optimal)
- **Aspect Ratio:** 16:9 optimized, 16:10 compatible
- **Input:** Keyboard (primary)
- **Browser:** Modern evergreen browsers with WebGL support

**Display Settings:**
- Fullscreen mode available
- Windowed mode default
- Responsive canvas scaling (maintains aspect ratio)

### Asset Requirements

**Visual Assets:**

**Art Style:** Pixel art with cyberpunk aesthetic, neon-glow effects, retro arcade feel

**Color Palette:**
- Background: Dark blues, purples, blacks (digital corridor vibe)
- Lasers: Bright reds, oranges (high visibility, danger indication)
- Diamonds: White (bright white glow), Blue (cyan/sapphire glow), Black (obsidian with purple glow)
- Character: Nerdy hacker with hoodie, backpack, glasses (relatable CS student aesthetic)

**Sprite Specifications:**
- Character sprite: 64×64 pixels, run cycle (6 frames), jump (4 frames), slide (3 frames)
- Diamond sprites: 32×32 pixels, idle glow animation (4 frames)
- Laser sprites: 16×128 pixels (vertical beam), glow effect
- Background tiles: 128×128 pixels, seamless tiling

**Animation Requirements:**
- Character run: 10 FPS animation speed (smooth but retro feel)
- Laser effects: Particle emitters with 2-3 particle types
- Diamond collection: 8-frame "pop" effect with score popup
- QTE interface: Slide-in animation (200ms)

**Visual Effects:**
- Glow shaders for lasers and diamonds (WebGL)
- Speed lines when running fast (particle trails)
- Screen shake on laser collision (subtle, 3-4 frames)
- Parallax scrolling for depth (3 layers)

---

**Audio Assets:**

**Music Style:** Synthwave/cyberpunk hybrid - upbeat tempo that increases with speed

**Music Tracks:**
- Main menu theme (looping, 1-2 minutes)
- Gameplay theme (looping, 2-3 minutes, BPM increases with speed)
- QTE tension stinger (5-10 seconds)
- Game over jingle (3-5 seconds)

**Sound Effects:**
- Footstep loop (synced to run animation)
- Jump/land sound effects
- Slide whoosh sound
- Laser hum (ambient when near)
- Laser collision alarm (sharp, attention-grabbing)
- Diamond collection chime (tier-specific pitch: low/mid/high)
- Code submit button click
- QTE key press (correct/incorrect feedback)
- UI navigation sounds

**Voice Acting:** None (text-only UI)

---

## Technical Architecture Requirements

### Engine Configuration

**Phaser 3 Setup:**

- **TypeScript:** Strict mode enabled for type safety
- **Physics:** Arcade Physics (lightweight, sufficient for 2D collision)
- **Renderer:** WebGL with automatic Canvas fallback
- **Scale Mode:** FIT (maintains aspect ratio, scales to window)

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
      gravity: { x: 0, y: 1200 }, // Vertical gravity for jump arc
      debug: false
    }
  },
  scene: [BootScene, MenuScene, GameScene, CodeEditorScene, QTEScene, GameOverScene]
};
```

### Code Architecture

**Required Systems:**

**Scene Management:**
- BootScene: Initial asset loading with progress bar
- MenuScene: Main menu, leaderboard, settings
- GameScene: Core endless runner gameplay
- CodeEditorScene: Overlay scene for coding challenges
- QTEScene: Overlay scene for quick-time events
- GameOverScene: Final score, leaderboard submission

**State Management:**
- Player state (position, velocity, current action)
- Run state (distance, speed multiplier, diamonds collected)
- Leaderboard data (local + server sync)
- Settings (audio volume, control preferences)
- Persistent data via LocalStorage

**Asset Loading:**
- Preload all sprites, animations, and audio for runner
- Lazy load Monaco Editor on first diamond collected
- Problem database loaded from JSON on boot

**Save/Load System:**
- LocalStorage for high scores and settings
- Optional backend integration for global leaderboard (REST API)

**Input Management:**
- Keyboard input handler with action buffering
- Input context switching (game vs code editor vs QTE)
- Coyote time and input buffer for forgiving controls

**Audio System:**
- Background music manager (dynamic tempo based on speed)
- Sound effect pool (prevent audio clipping)
- Mute/unmute toggle

**Performance Monitoring:**
- FPS counter (debug mode)
- Object pool stats (development only)

### Data Management

**Save Data Structure:**
```typescript
interface SaveData {
  playerName: string;
  highScores: {
    diamonds: number;
    distance: number;
    duration: number;
    date: string;
  }[];
  totalStats: {
    runsPlayed: number;
    totalDiamonds: number;
    totalDistance: number;
    problemsSolved: number;
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    fullscreen: boolean;
  };
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

**Obstacle Pattern Data:**
```typescript
interface ObstaclePattern {
  type: 'single' | 'double' | 'triple';
  lasers: {
    height: 'low' | 'high';
    offsetX: number; // Relative to pattern start
  }[];
  minSpeed: number; // Don't spawn this pattern until player reaches this speed
}
```

---

## Development Phases

### Phase 1: Core Systems (2-3 weeks)

#### Epic: Foundation

- Set up Phaser 3 + TypeScript project with build pipeline (Vite)
- Configure ESLint, Prettier for code quality
- Implement basic scene management (Boot, Menu, Game scenes)
- Create asset loading system with progress bar
- Set up LocalStorage save/load system
- Establish git repository and version control workflow

#### Epic: Core Mechanics

- Implement auto-scrolling system (player, camera, background parallax)
- Build player controller (jump and slide with physics)
- Create obstacle spawning system with object pooling
- Develop collision detection system
- Implement player animations (run, jump, slide)
- Create basic UI framework (score display, distance counter)

**Deliverable:** Playable endless runner with jump/slide mechanics and collision detection

---

### Phase 2: Gameplay Features (3-4 weeks)

#### Epic: Game Systems

- **Laser System Implementation:**
  - Laser sprite rendering with glow effects
  - Low/high laser types with hitbox configuration
  - Laser-player collision detection and response
  - Obstacle pattern system (single, double, triple)

- **Diamond System Implementation:**
  - Diamond sprite rendering (white/blue/black tiers)
  - Diamond spawning based on distance milestones
  - Diamond collection trigger and score tracking
  - Diamond particle effects and animations

- **QTE System Implementation:**
  - Pattern generation algorithm (random key sequences)
  - Input detection and validation
  - Timer system with visual feedback (progress bar, countdown)
  - Success/failure outcomes (resume vs game over)

#### Epic: Coding Challenge Integration

- **Code Editor Integration:**
  - Integrate Monaco Editor (lazy-load on first diamond)
  - Create overlay scene for code challenges
  - Implement syntax highlighting and autocomplete
  - Build submit/cancel UI

- **Code Execution Engine:**
  - Set up Web Worker for sandboxed JavaScript execution
  - Implement timeout protection (prevent infinite loops)
  - Build test case validation system
  - Create feedback UI (test results, error messages)

- **Problem Database:**
  - Create JSON structure for coding problems
  - Implement 15-20 initial problems (8 white, 8 blue, 4-6 black)
  - Write comprehensive test cases for each problem
  - Add hints and example solutions

**Deliverable:** Full gameplay loop - run, dodge, collect diamond, solve code, continue run

---

### Phase 3: Content & Polish (2 weeks)

#### Epic: Procedural Generation

- Finalize obstacle pattern library (10-15 patterns)
- Implement difficulty scaling formulas (speed, density, QTE)
- Balance diamond spawn rates and placement tiers
- Playtest and tune fairness guarantees

#### Epic: Visual & Audio Polish

- Create final character sprite sheets (run, jump, slide cycles)
- Design and implement particle effects (speed lines, explosions)
- Add screen shake and juice effects
- Integrate background music (dynamic tempo system)
- Implement sound effects for all interactions
- Create menu backgrounds and UI art

**Deliverable:** Polished endless runner with full audiovisual effects

---

### Phase 4: Optimization & Deployment (1-2 weeks)

#### Epic: Performance Optimization

- Profile and optimize rendering performance (object pooling verification)
- Reduce memory footprint (sprite atlas compression)
- Optimize code execution sandbox (worker efficiency)
- Test on target browsers (Chrome, Firefox, Safari)
- Fix performance bottlenecks to achieve 60 FPS

#### Epic: User Experience & Quality of Life

- Add pause menu with settings
- Implement audio volume controls
- Create tutorial tooltips for first run
- Build leaderboard UI (local scores + optional global API)
- Polish transitions and animations
- Add accessibility features (colorblind mode, key rebinding)

#### Epic: Testing & Bug Fixes

- Conduct playtesting sessions with peers
- Fix critical bugs and edge cases
- Balance coding problem difficulty based on feedback
- Ensure procedural generation never creates unfair patterns
- Test save/load functionality thoroughly

**Deliverable:** Production-ready game ready for deployment

---

### Phase 5: Deployment & Documentation (1 week)

#### Epic: Deployment

- Build production bundle (minified, optimized)
- Deploy to web hosting (GitHub Pages, Netlify, or Vercel)
- Test deployed version on multiple browsers
- Set up analytics (optional - track play sessions)

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
| **Phase 1: Core Systems** | 2-3 weeks | Playable runner with jump/slide |
| **Phase 2: Gameplay Features** | 3-4 weeks | Complete gameplay loop working |
| **Phase 3: Content & Polish** | 2 weeks | Procedural generation + audiovisual polish |
| **Phase 4: Optimization** | 1-2 weeks | Performance targets met, bug-free |
| **Phase 5: Deployment** | 1 week | Live deployment + documentation |
| **TOTAL** | **9-12 weeks** | **~2-3 months** |

---

**Critical Path Items:**
1. Auto-scrolling system (blocks everything)
2. Code editor integration (core unique mechanic)
3. Procedural obstacle spawning (enables endless gameplay)
4. Code sandboxing (security critical)

**Parallel Work Opportunities:**
- Art assets can be created while core systems are built
- Audio can be sourced/created during Phase 2-3
- Problem database can be populated independently
- Obstacle patterns can be designed during Phase 1

**Risk Mitigation:**
- **If Monaco Editor proves too complex:** Fall back to simple textarea with basic syntax highlighting
- **If procedural generation is too difficult:** Use pre-built pattern sequences that loop
- **If performance issues arise:** Reduce particle effects, simplify shaders

---

## Success Metrics

### Technical Metrics

- **Frame Rate:** Sustained 60 FPS on desktop browsers at 1920×1080
- **Load Time:** Initial game load <3 seconds on broadband
- **Crash Rate:** <1% of play sessions (target: zero critical bugs)
- **Memory Usage:** <256 MB RAM allocation
- **Browser Compatibility:** 100% functionality on Chrome 90+, Firefox 88+, Safari 14+

### Gameplay Metrics

- **Tutorial Completion:** 80%+ of players complete first 500m (learn all mechanics)
- **Average Run Duration:** 2-4 minutes per session
- **High Score Distribution:**
  - 50%+ of players reach 1000m
  - 20%+ of players reach 2000m
  - 5%+ of players reach 5000m
- **Code Challenge Success Rate:**
  - White diamonds: 85%+ solve rate
  - Blue diamonds: 60% solve rate
  - Black diamonds: 30% solve rate
- **QTE Success Rate:** 70%+ of players successfully recover from first laser collision

### Educational Outcomes

- **Problem Diversity:** Players attempt problems across all three tiers
- **Skill Progression:** Players improve solve time on repeated problem types
- **Persistence:** Average 2-3 retry attempts before solving medium/hard problems

### Project Success (Academic Context)

- **Code Quality:** Clean TypeScript with <10 ESLint warnings, well-documented
- **Feature Completeness:** All core mechanics implemented and functional
- **Playability:** Game is endlessly playable without critical bugs
- **Presentation:** Polished demo for academic presentation/showcase

---

## Appendices

### Change Log

| Date | Version | Description | Author |
| :--- | :------ | :---------- | :----- |
| 2025-10-19 | 2.0 | Complete redesign as endless runner format | Alex (Game Designer) |
| 2025-10-08 | 1.0 | Original isometric stealth puzzle design | Team |

### References

**Game Design Inspiration:**
- *Temple Run* - Endless runner core mechanics and progression
- *Subway Surfers* - Obstacle variety and visual polish
- *Flappy Bird* - Simple controls, high skill ceiling
- *CodeCombat* - Coding education through gameplay

**Technical References:**
- Phaser 3 Documentation: https://photonstorm.github.io/phaser3-docs/
- Monaco Editor Integration: https://microsoft.github.io/monaco-editor/
- LeetCode Problem Archive: https://leetcode.com/problemset/
- Procedural Generation Techniques: https://www.gamedeveloper.com/

**Educational Game Design:**
- *Human Resource Machine* - Programming puzzle mechanics
- *Hacknet* - Hacking simulation aesthetics
- *Vim Adventures* - Skill-building through gameplay

**Endless Runner References:**
- *Jetpack Joyride* - Side-scrolling endless runner excellence
- *Canabalt* - Minimalist runner design
- *Alto's Adventure* - Procedural generation and flow state

---

**End of Document**
