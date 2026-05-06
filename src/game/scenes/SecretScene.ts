import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { SceneFlow, SCENES } from '../systems/SceneFlow';
import { gameSession } from '../systems/GameSession';

export class SecretScene extends Phaser.Scene {
  constructor() {
    super(SCENES.secret);
  }

  create(): void {
    gameSession.setStage('secret');

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'secret-ending').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.input.on('pointerup', () => {
      SceneFlow.restartJourney(this);
    });

    this.input.keyboard?.once('keydown-SPACE', () => {
      SceneFlow.restartJourney(this);
    });
  }
}
