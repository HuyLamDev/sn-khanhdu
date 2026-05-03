import {
  MAZE_TARGET_COLLECTIBLES,
  RUNNER_GOAL_OBSTACLES,
  STAGE_TIMERS,
} from "../game/config/stageConfig";

export type StageContent = {
  timerSeconds: number;
};

export type MazeStageContent = StageContent & {
  targetCollectibles: number;
  enemySpeed: number;
  playerSpeed: number;
};

export type RunnerStageContent = {
  goalObstacles: number;
  jumpVelocity: number;
  scrollSpeed: number;
  scrollAcceleration: number;
};

export const stageContent = {
  quiz: {
    timerSeconds: STAGE_TIMERS.quiz,
  },
  maze: {
    timerSeconds: STAGE_TIMERS.maze,
    targetCollectibles: MAZE_TARGET_COLLECTIBLES,
    enemySpeed: 138,
    playerSpeed: 140,
  } satisfies MazeStageContent,
  runner: {
    goalObstacles: RUNNER_GOAL_OBSTACLES,
    jumpVelocity: -680,
    scrollSpeed: 220,
    scrollAcceleration: 18,
  } satisfies RunnerStageContent,
} satisfies {
  quiz: StageContent;
  maze: MazeStageContent;
  runner: RunnerStageContent;
};
