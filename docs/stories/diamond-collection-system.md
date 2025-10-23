# Story: Diamond Collection & Coding Challenge System

**Status:** Ready for Development

**Priority:** High

**Epic:** Phase 2 - Gameplay Features

---

## Story

Implement the diamond collection and coding challenge system. Players collect diamonds (white/blue/black tiers) that appear in the running corridor. Collecting a diamond pauses the game and presents a Python coding challenge overlay. Solving the challenge adds the diamond to the player's score and resumes the run.

---

## Acceptance Criteria

- [ ] Diamonds spawn at three difficulty tiers (white/blue/black) with correct visual representation
- [ ] Diamonds spawn at correct intervals (white: 200-300m, blue: 600-800m, black: 1200-1600m)
- [ ] Collecting a diamond pauses Game scene and displays challenge overlay
- [ ] Coding problems are presented with clear descriptions, examples, and test cases
- [ ] Players can write Python solutions with syntax highlighting
- [ ] Solutions are validated against test cases with immediate feedback
- [ ] Successful solutions add diamond to score and resume game at same state
- [ ] Failed solutions allow retry or forfeit without penalty (except lost points)
- [ ] Score updates correctly reflect diamond collection (white: 1pt, blue: 3pts, black: 10pts)

---

## Dev Notes

**Architecture Approach (Modular, matches codebase):**
- Use existing `EventBus.ts` for scene communication (decoupled events)
- `Diamond.ts` object class in `objects/` (similar to `Laser.ts`, `RunnerPlayer.ts`)
- `DiamondSpawner.ts` in `objects/` handles spawning logic (similar to obstacle system)
- `ChallengeOverlayScene.ts` overlays on Game scene (pause/resume pattern)
- JSON data files for challenges and spawn patterns in `public/data/`
- Separate `ChallengeUI.ts` in `ui/` for rendering challenge interface
- Separate `PythonValidator.ts` in `systems/` for code execution/validation

**Key Considerations:**
- Follow existing patterns: `objects/`, use EventBus for communication
- Spawn timing based on distance traveled (match Game.ts distance tracking)
- Visual distinction: different colors, glow animations, floating behavior
- Python sandbox execution (sandboxed eval, no external libraries)
- Simple UI: DOM textarea with syntax highlighting (no Monaco - too heavy)
- Three-tier difficulty mapping to diamond colors

---

## Tasks

### Task 1: Create Diamond Class
- [ ] Create `src/game/objects/Diamond.ts` with sprite, tier (white/blue/black), height
- [ ] Implement visual rendering (different colors, glow effects)
- [ ] Add floating animation (similar to Laser pattern)
- [ ] Store challengeId and diamondType as sprite data

### Task 2: Create DiamondSpawner
- [ ] Create `src/game/objects/DiamondSpawner.ts`
- [ ] Load spawn patterns from `public/data/spawn_patterns.json`
- [ ] Implement `spawnDiamond()` to create physics sprites
- [ ] Implement `update(distance)` to trigger spawns at correct milestones
- [ ] Clean up off-screen diamonds
- [ ] Create `diamondsGroup` physics group for collision detection

### Task 3: Create Challenge Data & Manager
- [ ] Create `public/data/challenges.json` with 20 problems (8 white, 8 blue, 4 black)
- [ ] Each challenge: id, tier, title, description, examples, correctAnswer, reward
- [ ] Create `src/game/systems/ChallengeManager.ts`
- [ ] Implement `getChallenge(id)`, `getChallengesByTier(tier)`, `markComplete(id)`

### Task 4: Create ChallengeUI
- [ ] Create `src/game/ui/ChallengeUI.ts`
- [ ] Render challenge panel with title, description, examples, code input
- [ ] Create textarea for Python code input with basic syntax highlighting
- [ ] Add Submit and Forfeit buttons
- [ ] Implement result display (pass/fail with explanation)

### Task 5: Create PythonValidator
- [ ] Create `src/game/systems/PythonValidator.ts`
- [ ] Implement safe Python execution (isolated environment)
- [ ] Create test case runner against user code
- [ ] Handle errors, timeouts, and edge cases
- [ ] Return result object: { passed: boolean, testResults: [...], error?: string }

### Task 6: Create ChallengeOverlayScene
- [ ] Create `src/game/scenes/ChallengeOverlayScene.ts`
- [ ] Render semi-transparent backdrop to block Game scene input
- [ ] Initialize ChallengeManager and ChallengeUI
- [ ] Load challenge from data passed from Game scene
- [ ] Wire success/failure callbacks to resume Game scene
- [ ] Emit `diamondCollected` event via EventBus on success

### Task 7: Integrate Diamond Collision in Game Scene
- [ ] Add `DiamondSpawner` initialization in `Game.ts` create()
- [ ] Wire physics overlap: `player.sprite` vs `diamondSpawner.diamondsGroup`
- [ ] Implement `handleDiamondCollision()` callback:
  - Pause Game scene
  - Store game state (distance, diamondId, tier)
  - Launch ChallengeOverlayScene with state
  - Hide diamond temporarily

### Task 8: Implement Event Flow
- [ ] Wire `EventBus.on('diamondCollected', ...)` in Game scene
- [ ] Update score and UI on successful collection
- [ ] Handle resume Game scene after challenge completes
- [ ] Handle forfeit path (resume without points)
- [ ] Ensure game state preserved after pause/resume

### Task 9: Visual Polish
- [ ] Add diamond collection particle effect
- [ ] Add score popup animation (+1, +3, +10 based on tier)
- [ ] Smooth scene transition (backdrop fade, panel slide)
- [ ] Visual feedback for test results (green/red indicators)
- [ ] Optional audio cues (collection, success, fail sounds)

---

## Testing Checklist

- [ ] Diamonds spawn at correct distance intervals
- [ ] Diamond visuals display correctly (three colors, animation)
- [ ] Collecting diamond pauses Game and shows overlay
- [ ] Challenge displays correctly with all content
- [ ] Python code submission validates against test cases
- [ ] Test results display correctly (all pass/some fail/errors)
- [ ] Successful solution updates score and resumes game
- [ ] Forfeit option works without penalty
- [ ] Game resumes at exact same state (distance, speed,
 position)
- [ ] Multiple diamonds in run don't repeat challenges
- [ ] Python sandbox prevents malicious code execution
- [ ] UI is responsive and doesn't freeze game

---

## File List

**New Files:**
- `src/game/objects/Diamond.ts` - Diamond class
- `src/game/objects/DiamondSpawner.ts` - Spawning system
- `src/game/systems/ChallengeManager.ts` - Challenge data management
- `src/game/systems/PythonValidator.ts` - Code validation
- `src/game/ui/ChallengeUI.ts` - Challenge UI rendering
- `src/game/scenes/ChallengeOverlayScene.ts` - Overlay scene
- `public/data/challenges.json` - Challenge database
- `public/data/spawn_patterns.json` - Spawn configuration

**Modified Files:**
- `src/game/scenes/Game.ts` - Add spawner, collision, event listeners
- `src/game/main.ts` - Add ChallengeOverlayScene to scene list

---

## Dev Agent Record

**Agent:** James (Full Stack Developer)

**Started:** [pending]

**Completed:** [pending]

**Debug Log:**
- [placeholder]

**Completion Notes:**
- [placeholder]

**Change Log:**
- [placeholder]
