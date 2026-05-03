import type Phaser from 'phaser';

type ColliderFunction = Phaser.Physics.Arcade.ArcadePhysics['add']['collider'];
type ColliderObject1 = Parameters<ColliderFunction>[0];
type ColliderObject2 = Parameters<ColliderFunction>[1];
type ColliderCallback = NonNullable<Parameters<ColliderFunction>[2]>;

type PhysicsAdder = {
  add: {
    collider: ColliderFunction;
  };
};

export function registerRunnerObstacleCollision(
  physics: PhysicsAdder,
  player: ColliderObject1,
  obstacles: ColliderObject2,
  onHit: ColliderCallback,
): unknown {
  return physics.add.collider(player, obstacles, onHit);
}
