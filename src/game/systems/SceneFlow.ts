import Phaser from 'phaser';
import type { StageKey } from './GameSession';
import { gameSession } from './GameSession';

export const SCENES = {
  boot: 'BootScene',
  intro: 'IntroScene',
  quiz: 'QuizScene',
  maze: 'MazeScene',
  runner: 'RunnerScene',
  win: 'WinScene',
  lose: 'LoseScene',
} as const;

const STAGE_TO_SCENE: Record<StageKey, string> = {
  intro: SCENES.intro,
  quiz: SCENES.quiz,
  maze: SCENES.maze,
  runner: SCENES.runner,
  win: SCENES.win,
  lose: SCENES.lose,
};

export const SceneFlow = {
  goTo(scene: Phaser.Scene, stage: StageKey): void {
    gameSession.setStage(stage);
    scene.scene.start(STAGE_TO_SCENE[stage]);
  },

  restartJourney(scene: Phaser.Scene): void {
    gameSession.reset();
    scene.scene.start(SCENES.intro);
  },

  loseRun(scene: Phaser.Scene): void {
    gameSession.setStage('lose');
    scene.scene.start(SCENES.lose);
  },
};
