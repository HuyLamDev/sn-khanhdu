# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Type-check + build to dist/
npm run preview  # Preview the production build
```

No test runner is configured.

## Architecture

A Phaser 3 + TypeScript + Vite browser game. Entry point is `src/main.ts`, which boots a single `Phaser.Game` instance with all scenes registered in `src/game/config/gameConfig.ts`.

**Scene flow** — linear, managed by `SceneFlow` in `src/game/systems/SceneFlow.ts`:

```
BootScene → IntroScene → QuizScene → MazeScene → RunnerScene → WinScene
                                                              ↘ LoseScene (any timer expiry)
```

`SceneFlow.goTo()` updates `GameSession` state and transitions scenes. `SceneFlow.loseRun()` goes directly to `LoseScene`. `SceneFlow.restartJourney()` resets session and returns to intro.

**Shared state** — `GameSession` singleton (`src/game/systems/GameSession.ts`) is a plain immutable-update object tracking stage, quiz score, maze collectibles, and runner distance. Import `gameSession` directly; no dependency injection.

**Content/config separation**:
- `src/game/config/stageConfig.ts` — numeric constants (dimensions, timers, win conditions)
- `src/content/stages.ts` — typed `stageContent` object that combines config constants with runtime parameters (speeds, distances); scenes consume this
- `src/content/questions.ts` and `src/content/story.ts` — editable quiz and narrative text

**Gameplay systems** — `TimerSystem` (`src/game/systems/TimerSystem.ts`) is instantiated per-scene, mounted to a canvas position, and destroyed on scene shutdown via the `SHUTDOWN` event.

**Working rules** (from AGENTS.md):
- Keep the project intentionally small; prefer straightforward scene logic over abstractions
- Do not add backend, persistence, or `src/ui/` layer unless explicitly required
- Keep story and quiz content easy to edit
