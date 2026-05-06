import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { SceneFlow, SCENES } from '../systems/SceneFlow';
import { gameSession } from '../systems/GameSession';

export class WinScene extends Phaser.Scene {
  constructor() {
    super(SCENES.win);
  }

  create(): void {
    gameSession.setStage('win');

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'win-bg').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    const secretBtn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'Secret Ending', {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '26px',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    secretBtn.on('pointerup', () => {
      SceneFlow.goTo(this, 'secret');
    });
  }
}
