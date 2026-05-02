import Phaser from 'phaser';

export class MazeEnemy extends Phaser.Physics.Arcade.Sprite {
  private readonly moveSpeed: number;
  private pathTarget: { x: number; y: number } | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    moveSpeed: number,
  ) {
    super(scene, x, y, texture);

    this.moveSpeed = moveSpeed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
  }

  setPathTarget(x: number, y: number): void {
    this.pathTarget = { x, y };
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (!body || !this.active || this.pathTarget === null) {
      body?.setVelocity(0, 0);
      return;
    }

    const direction = new Phaser.Math.Vector2(
      this.pathTarget.x - this.x,
      this.pathTarget.y - this.y,
    );

    if (direction.lengthSq() < 16) {
      // Close enough to the target cell centre — hold still until next path update.
      body.setVelocity(0, 0);
      return;
    }

    direction.normalize().scale(this.moveSpeed);
    body.setVelocity(direction.x, direction.y);
  }
}
