import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import type { StageIntroData } from '../systems/SceneFlow';
import { SCENES, SceneFlow } from '../systems/SceneFlow';

export class StageIntroScene extends Phaser.Scene {
  private introData!: StageIntroData;
  private bgm?: Phaser.Sound.BaseSound;

  constructor() {
    super(SCENES.stageIntro);
  }

  init(data: StageIntroData): void {
    this.introData = data;
  }

  create(): void {
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 760, 380, 0xfff7fa, 0.96)
      .setStrokeStyle(3, 0xe7b5c7);

    this.add
      .text(GAME_WIDTH / 2, 130, this.introData.title, {
        color: '#7a284b',
        fontSize: '42px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 240, this.introData.preludeText, {
        align: 'center',
        color: '#5b4150',
        fontSize: '24px',
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);

    this.bgm = this.sound.add(this.introData.soundKey);
    this.bgm.play();

    const button = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 125, 'Begin', {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '28px',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerup', () => {
      this.bgm?.stop();
      SceneFlow.launchGameplay(this, this.introData.stage);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.bgm?.stop();
    });
  }
}
