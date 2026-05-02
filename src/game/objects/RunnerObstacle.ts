import Phaser from 'phaser';

export class RunnerObstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    this.setImmovable(true);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    body?.setAllowGravity(false);
  }

  launch(x: number, y: number, velocityX: number): void {
    this.enableBody(true, x, y, true, true);
    (this.body as Phaser.Physics.Arcade.Body | null)?.setAllowGravity(false);
    this.setVelocityX(velocityX);
  }

  park(offscreenX: number, y: number): void {
    this.disableBody(true, true);
    this.setPosition(offscreenX, y);
    this.setVelocity(0, 0);
  }
}
