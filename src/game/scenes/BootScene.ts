import Phaser from 'phaser';
import { SCENES } from '../systems/SceneFlow';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.boot);
  }

  preload(): void {
    this.load.audio('round1', 'sound round 1.mp3');
    this.load.audio('round2', 'sound round 2.mp3');
    this.load.audio('round3', 'sound round 3.mp3');
  }

  create(): void {
    this.scene.start(SCENES.intro);
  }
}
