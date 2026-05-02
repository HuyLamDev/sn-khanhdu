# Grid-Driven Maze Design

**Date:** 2026-05-02  
**Scope:** Replace the hardcoded `WALL_LAYOUT` / `COLLECTIBLE_POSITIONS` constants in `MazeScene.ts` with a proper grid-driven maze. Add BFS pathfinding for the enemy. Player movement stays free/physics-based.

---

## 1. Grid Specification

- **Dimensions:** 20 columns × 9 rows
- **Cell size:** 40 × 40 px
- **Arena origin:** `ARENA.x = 80`, `ARENA.y = 110` (unchanged)
- **Cell-to-world:** `worldX = ARENA.x + col * 40 + 20`, `worldY = ARENA.y + row * 40 + 20`
- **World-to-cell:** `col = floor((wx - ARENA.x) / 40)`, `row = floor((wy - ARENA.y) / 40)`

---

## 2. Data Layer — `src/content/maze.ts`

Exports two constants:

```ts
export const MAZE_GRID: number[][] // 9 rows × 20 cols. 1 = wall, 0 = open floor.
export const MAZE_COLLECTIBLES: [number, number][] // [col, row] of the 3 heart pickups
```

Rules for `MAZE_GRID`:
- The entire outer ring (row 0, row 8, col 0, col 19) is all `1`s — this replaces the four explicit arena-boundary rectangles currently in `createWalls()`.
- Interior cells define corridors and wall segments.
- All `MAZE_COLLECTIBLES` positions must be open cells (`0`).

`WALL_LAYOUT` and `COLLECTIBLE_POSITIONS` constants in `MazeScene.ts` are deleted. `stageConfig.ts` and `stages.ts` are unchanged.

---

## 3. Wall Rendering

`createWalls()` in `MazeScene.ts` iterates `MAZE_GRID`. For every cell where `grid[row][col] === 1`, it places a 40×40 Arcade static physics block at the cell's world-center position using `setDisplaySize(40, 40)` on the existing `WALL_TEXTURE_KEY` texture.

`createCollectibles()` iterates `MAZE_COLLECTIBLES`, converts each `[col, row]` to world coords, and places a heart there — same physics setup as before.

`this.physics.world.setBounds` stays set to `ARENA` dimensions.

---

## 4. BFS Pathfinder — `src/game/systems/MazePathfinder.ts`

Exports a single pure function:

```ts
export function findNextStep(
  grid: number[][],
  fromCol: number, fromRow: number,
  toCol: number,   toRow: number,
): { col: number; row: number } | null
```

- BFS from `(fromCol, fromRow)` to `(toCol, toRow)`.
- Impassable: any cell where `grid[row][col] === 1`.
- Explores 4 cardinal neighbours only (no diagonals).
- Returns the **second cell on the shortest path** (first step after the enemy's current cell).
- Returns `null` if no path exists or start equals goal.

---

## 5. Enemy Pathfinding Integration

`MazeEnemy.ts` gains a `setPathTarget(wx: number, wy: number): void` method. `update()` steers toward this target (normalized direction × speed) instead of directly toward the player. The existing `setVelocity` approach is kept.

In `MazeScene.create()`, a `this.time.addEvent` fires every **500 ms**:
1. Convert enemy and player world positions to grid cells via `worldToCell`.
2. Call `findNextStep(MAZE_GRID, ...)`.
3. Convert the returned step cell back to world coords.
4. Call `enemy.setPathTarget(wx, wy)`.

The timer event is cleared on scene shutdown alongside `TimerSystem`.

---

## 6. MazeScene Changes Summary

| What | Change |
|---|---|
| `WALL_LAYOUT` constant | Deleted |
| `COLLECTIBLE_POSITIONS` constant | Deleted |
| Import `MAZE_GRID`, `MAZE_COLLECTIBLES` | Added from `src/content/maze.ts` |
| `createWalls()` | Rewritten to iterate `MAZE_GRID` |
| `createCollectibles()` | Rewritten to iterate `MAZE_COLLECTIBLES` |
| Player spawn | `cellToWorld(1, 1)` |
| Enemy spawn | `cellToWorld(18, 7)` |
| Path recompute timer | New `time.addEvent` every 500 ms |
| Dev label `'Maze Scene'` text | Removed |
| `story.mazePrelude` overlay text | Removed (out of scope for this change) |
| All other logic (timer, collectHeart, unlockExit, loseStage, GameSession) | Unchanged |

---

## 7. Files Touched

| File | Action |
|---|---|
| `src/content/maze.ts` | **New** — grid data and collectible positions |
| `src/game/systems/MazePathfinder.ts` | **New** — BFS function |
| `src/game/objects/MazeEnemy.ts` | **Modified** — add `setPathTarget`, update `update()` |
| `src/game/scenes/MazeScene.ts` | **Modified** — wire grid, pathfinder, new spawns |
