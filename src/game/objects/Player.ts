import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly moveSpeed: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    moveSpeed: number,
  ) {
    super(scene, x, y, texture);

    this.cursors = cursors;
    this.moveSpeed = moveSpeed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDrag(900, 900);
    this.setMaxVelocity(moveSpeed, moveSpeed);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    body?.setAllowGravity(false);
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    let velocityX = 0;
    let velocityY = 0;

    if (!body) {
      return;
    }

    if (this.cursors.left?.isDown) {
      velocityX -= this.moveSpeed;
    } else if (this.cursors.right?.isDown) {
      velocityX += this.moveSpeed;
    }

    if (this.cursors.up?.isDown) {
      velocityY -= this.moveSpeed;
    } else if (this.cursors.down?.isDown) {
      velocityY += this.moveSpeed;
    }

    this.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 && velocityY !== 0) {
      body.velocity.normalize().scale(this.moveSpeed);
    }
  }
}
