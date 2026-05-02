import Phaser from 'phaser';
import { story } from '../../content/story';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { gameSession } from '../systems/GameSession';
import { SceneFlow, SCENES } from '../systems/SceneFlow';

const BODY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  color: '#5b4150',
  fontSize: '24px',
  wordWrap: { width: 700 },
};

export class IntroScene extends Phaser.Scene {
  constructor() {
    super(SCENES.intro);
  }

  create(): void {
    gameSession.reset();
    gameSession.setStage('intro');

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 380, 0xfff7fa, 0.96)
      .setStrokeStyle(3, 0xe7b5c7);

    this.add
      .text(GAME_WIDTH / 2, 130, story.intro.title, {
        color: '#7a284b',
        fontSize: '42px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 240, story.intro.body, BODY_STYLE)
      .setOrigin(0.5);

    const button = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 125, 'Start Journey', {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '28px',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerup', () => {
      SceneFlow.goTo(this, 'quiz');
    });
  }
}
