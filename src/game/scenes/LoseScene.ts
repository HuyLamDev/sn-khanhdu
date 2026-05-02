import Phaser from 'phaser';
import { story } from '../../content/story';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { gameSession } from '../systems/GameSession';
import { SceneFlow, SCENES } from '../systems/SceneFlow';

const BODY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  color: '#4b2436',
  fontSize: '24px',
  wordWrap: { width: 700 },
};

export class LoseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.lose);
  }

  create(): void {
    gameSession.setStage('lose');
    const session = gameSession.getState();

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 380, 0xfff7fa, 0.96)
      .setStrokeStyle(3, 0xe7b5c7);

    this.add
      .text(GAME_WIDTH / 2, 150, story.lose.title, {
        color: '#7a284b',
        fontSize: '40px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        245,
        `${story.lose.body}\n\nQuiz score before reset: ${session.quizScore}`,
        BODY_STYLE,
      )
      .setOrigin(0.5);

    const restart = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 120, 'Return To Start', {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '26px',
        padding: { x: 16, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    restart.on('pointerup', () => {
      SceneFlow.restartJourney(this);
    });

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Click the button or press Space to restart from IntroScene.', {
        align: 'center',
        color: '#6d5461',
        fontSize: '18px',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-SPACE', () => {
      SceneFlow.restartJourney(this);
    });
  }
}
