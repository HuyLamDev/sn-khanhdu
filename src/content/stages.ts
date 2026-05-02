import {
  MAZE_TARGET_COLLECTIBLES,
  RUNNER_GOAL_DISTANCE,
  STAGE_TIMERS,
} from '../game/config/stageConfig';

export type StageContent = {
  timerSeconds: number;
};

export type MazeStageContent = StageContent & {
  targetCollectibles: number;
  enemySpeed: number;
  playerSpeed: number;
};

export type RunnerStageContent = StageContent & {
  goalDistance: number;
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
    enemySpeed: 110,
    playerSpeed: 140,
  } satisfies MazeStageContent,
  runner: {
    timerSeconds: STAGE_TIMERS.runner,
    goalDistance: RUNNER_GOAL_DISTANCE,
    jumpVelocity: -680,
    scrollSpeed: 220,
    scrollAcceleration: 18,
  } satisfies RunnerStageContent,
} satisfies {
  quiz: StageContent;
  maze: MazeStageContent;
  runner: RunnerStageContent;
};
