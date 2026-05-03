import Phaser from 'phaser';
import { stageContent } from '../../content/stages';
import { MAZE_COLLECTIBLES, MAZE_GRID } from '../../content/maze';
import { MazeEnemy } from '../objects/MazeEnemy';
import { Player } from '../objects/Player';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { gameSession } from '../systems/GameSession';
import { SceneFlow, SCENES } from '../systems/SceneFlow';
import { TimerSystem } from '../systems/TimerSystem';
import { findNextStep } from '../systems/MazePathfinder';

const PLAYER_TEXTURE_KEY = 'maze-princess';
const ENEMY_TEXTURE_KEY = 'maze-enemy';
const HEART_TEXTURE_KEY = 'maze-heart';
const WALL_TEXTURE_KEY = 'maze-wall';

const ARENA = {
  x: 80,
  y: 110,
  width: 800,
  height: 360,
} as const;

const CELL = 40;

function cellToWorld(col: number, row: number): { x: number; y: number } {
  return {
    x: ARENA.x + col * CELL + CELL / 2,
    y: ARENA.y + row * CELL + CELL / 2,
  };
}

function worldToCell(wx: number, wy: number): { col: number; row: number } {
  return {
    col: Math.floor((wx - ARENA.x) / CELL),
    row: Math.floor((wy - ARENA.y) / CELL),
  };
}

export class MazeScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private player?: Player;
  private enemy?: MazeEnemy;
  private walls?: Phaser.Physics.Arcade.StaticGroup;
  private hearts?: Phaser.Physics.Arcade.Group;
  private timer?: TimerSystem;
  private collectedText?: Phaser.GameObjects.Text;
  private objectiveText?: Phaser.GameObjects.Text;
  private continuePrompt?: Phaser.GameObjects.Text;
  private continueKey?: Phaser.Input.Keyboard.Key;
  private isComplete = false;
  private isEnding = false;

  constructor() {
    super(SCENES.maze);
  }

  preload(): void {
    this.load.image(PLAYER_TEXTURE_KEY, 'assets/maze-player-kdu.png');
    this.load.image(ENEMY_TEXTURE_KEY, 'assets/maze-enemy-hung-huynh.png');
    this.load.image(WALL_TEXTURE_KEY, 'assets/maze-wall-tlmh.png');
  }

  create(): void {
    gameSession.setStage('maze');
    gameSession.setMazeCollected(0);
    this.isComplete = false;
    this.isEnding = false;

    this.createTextures();
    this.physics.world.setBounds(ARENA.x, ARENA.y, ARENA.width, ARENA.height);
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.continueKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 24,
      ARENA.width + 28,
      ARENA.height + 28,
      0xf9d8e4,
    );
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 24,
      ARENA.width,
      ARENA.height,
      0xfff7f9,
    );

    this.collectedText = this.add.text(
      64,
      GAME_HEIGHT - 54,
      this.getCollectedLabel(0),
      {
        color: '#7a284b',
        fontSize: '24px',
        fontStyle: 'bold',
      },
    );

    this.objectiveText = this.add
      .text(
        GAME_WIDTH - 64,
        GAME_HEIGHT - 54,
        'Find all hearts and avoid the shadow.',
        {
          align: 'right',
          color: '#4b2436',
          fontSize: '18px',
        },
      )
      .setOrigin(1, 0);

    this.walls = this.physics.add.staticGroup();
    this.createWalls();

    this.hearts = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.createCollectibles();

    const playerPos = cellToWorld(1, 1);
    this.player = new Player(
      this,
      playerPos.x,
      playerPos.y,
      PLAYER_TEXTURE_KEY,
      this.cursors ?? this.input.keyboard!.createCursorKeys(),
      stageContent.maze.playerSpeed,
    );
    this.player.setDisplaySize(CELL - 6, CELL - 6);

    const enemyPos = cellToWorld(9, 4);
    this.enemy = new MazeEnemy(
      this,
      enemyPos.x,
      enemyPos.y,
      ENEMY_TEXTURE_KEY,
      stageContent.maze.enemySpeed,
    );
    this.enemy.setDisplaySize(CELL - 6, CELL - 6);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemy, this.walls);
    this.physics.add.collider(this.enemy, this.player, () => {
      this.loseStage();
    });
    this.physics.add.overlap(this.player, this.hearts, (_, heart) => {
      this.collectHeart(heart as Phaser.Physics.Arcade.Image);
    });

    this.timer = new TimerSystem(this, stageContent.maze.timerSeconds, () => {
      this.loseStage();
    });
    this.timer.mount(GAME_WIDTH - 170, 28);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.timer?.destroy();
    });
  }

  update(): void {
    if (this.isComplete || this.isEnding) {
      this.enemy?.setVelocity(0, 0);
      this.player?.setVelocity(0, 0);
    } else {
      this.player?.update();
      if (this.player && this.enemy) {
        const from = worldToCell(this.enemy.x, this.enemy.y);
        const to = worldToCell(this.player.x, this.player.y);
        const step = findNextStep(MAZE_GRID, from.col, from.row, to.col, to.row);
        if (step) {
          const target = cellToWorld(step.col, step.row);
          this.enemy.setPathTarget(target.x, target.y);
        }
      }
      this.enemy?.update();
    }

    if (
      this.isComplete &&
      !this.isEnding &&
      this.continueKey &&
      Phaser.Input.Keyboard.JustDown(this.continueKey)
    ) {
      this.goToRunner();
    }
  }

  private createTextures(): void {
    if (!this.textures.exists(HEART_TEXTURE_KEY)) {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(0xff5d8f, 1);
      graphics.fillCircle(10, 10, 6);
      graphics.fillCircle(22, 10, 6);
      graphics.fillTriangle(4, 14, 28, 14, 16, 28);
      graphics.generateTexture(HEART_TEXTURE_KEY, 32, 32);
      graphics.destroy();
    }
  }

  private createWalls(): void {
    if (!this.walls) return;

    MAZE_GRID.forEach((rowData, row) => {
      rowData.forEach((cell, col) => {
        if (cell !== 1) return;
        const pos = cellToWorld(col, row);
        const wall = this.walls!.create(pos.x, pos.y, WALL_TEXTURE_KEY) as Phaser.Physics.Arcade.Image;
        wall.setDisplaySize(CELL, CELL);
        (wall.body as Phaser.Physics.Arcade.StaticBody).setSize(CELL, CELL);
        wall.refreshBody();
      });
    });
  }

  private createCollectibles(): void {
    if (!this.hearts) return;

    for (const [col, row] of MAZE_COLLECTIBLES) {
      const pos = cellToWorld(col, row);
      const collectible = this.hearts.create(
        pos.x,
        pos.y,
        HEART_TEXTURE_KEY,
      ) as Phaser.Physics.Arcade.Image;

      collectible.setScale(0.9);
      const body = collectible.body as Phaser.Physics.Arcade.Body | null;
      body?.setCircle(12, 4, 4);
    }
  }

  private collectHeart(heart: Phaser.Physics.Arcade.Image): void {
    if (!heart.active || this.isEnding) {
      return;
    }

    heart.disableBody(true, true);

    const collected = gameSession.getState().mazeCollected + 1;
    gameSession.setMazeCollected(collected);
    this.collectedText?.setText(this.getCollectedLabel(collected));

    if (collected >= stageContent.maze.targetCollectibles) {
      this.unlockExit();
    }
  }

  private unlockExit(): void {
    if (this.isComplete) {
      return;
    }

    this.isComplete = true;
    this.objectiveText?.setText('All hearts found. Press SPACE or click continue.');

    this.continuePrompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 96, 'Continue To The Final Run', {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '24px',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.continuePrompt.on('pointerup', () => {
      this.goToRunner();
    });
  }

  private goToRunner(): void {
    if (this.isEnding) {
      return;
    }

    this.isEnding = true;
    this.timer?.stop();
    SceneFlow.goTo(this, 'runner');
  }

  private loseStage(): void {
    if (this.isEnding) {
      return;
    }

    this.isEnding = true;
    this.timer?.stop();
    SceneFlow.loseRun(this);
  }

  private getCollectedLabel(collected: number): string {
    return `Hearts: ${collected}/${stageContent.maze.targetCollectibles}`;
  }
}
