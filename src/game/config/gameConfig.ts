import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { IntroScene } from '../scenes/IntroScene';
import { LoseScene } from '../scenes/LoseScene';
import { MazeScene } from '../scenes/MazeScene';
import { QuizScene } from '../scenes/QuizScene';
import { RunnerScene } from '../scenes/RunnerScene';
import { WinScene } from '../scenes/WinScene';
import { GAME_HEIGHT, GAME_WIDTH } from './stageConfig';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#fff4f6',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [
    BootScene,
    IntroScene,
    QuizScene,
    MazeScene,
    RunnerScene,
    WinScene,
    LoseScene,
  ],
};
