import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { AppBGM } from '../systems/AppBGM';
import { SCENES } from '../systems/SceneFlow';

const BAR_W = 400;
const BAR_H = 18;

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    this.load.audio('app-bg-music', 'app-bg-music.mp3');
    this.load.audio('round1', 'sound round 1.mp3');
    this.load.audio('round2', 'sound round 2.mp3');
    this.load.audio('round3', 'sound round 3.mp3');
    this.load.image('maze-princess', 'assets/maze-player-kdu.png');
    this.load.image('maze-enemy', 'assets/maze-enemy-hung-huynh.png');
    this.load.image('maze-wall', 'assets/maze-wall-tlmh.png');
    this.load.image('runner-player', 'assets/obstacle-player-kdu.png');
    this.load.image('runner-obstacle', 'assets/obstacle-hung-huynh.png');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0xfff4f6);

    this.add.text(cx, cy - 28, 'Loading…', {
      color: '#7a284b',
      fontSize: '20px',
    }).setOrigin(0.5);

    const track = this.add.rectangle(cx, cy + 10, BAR_W, BAR_H, 0xf9d8e4).setOrigin(0.5);
    const fill = this.add.rectangle(cx - BAR_W / 2, cy + 10, 0, BAR_H, 0xe87fa8).setOrigin(0, 0.5);

    void track;

    this.load.on('progress', (value: number) => {
      fill.width = BAR_W * value;
    });
  }

  create(): void {
    AppBGM.init(this.sound.add('app-bg-music', { loop: true, volume: 0.6 }));
    AppBGM.resume();
    this.scene.start(SCENES.intro);
  }
}
