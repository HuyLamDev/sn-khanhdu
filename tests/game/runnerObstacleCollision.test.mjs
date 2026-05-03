import test from 'node:test';
import assert from 'node:assert/strict';

import { registerRunnerObstacleCollision } from '../../src/game/scenes/registerRunnerObstacleCollision.ts';

test('registerRunnerObstacleCollision uses collider instead of overlap', () => {
  const calls = [];
  const physics = {
    add: {
      collider: (...args) => {
        calls.push({ type: 'collider', args });
        return { kind: 'collider' };
      },
      overlap: (...args) => {
        calls.push({ type: 'overlap', args });
        return { kind: 'overlap' };
      },
    },
  };
  const player = { id: 'player' };
  const obstacles = { id: 'obstacles' };
  const onHit = () => {};

  const result = registerRunnerObstacleCollision(physics, player, obstacles, onHit);

  assert.deepEqual(calls, [{ type: 'collider', args: [player, obstacles, onHit] }]);
  assert.deepEqual(result, { kind: 'collider' });
});
