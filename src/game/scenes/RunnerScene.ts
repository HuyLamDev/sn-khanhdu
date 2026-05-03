import Phaser from "phaser";
import { stageContent } from "../../content/stages";
import { RunnerObstacle } from "../objects/RunnerObstacle";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/stageConfig";
import { gameSession } from "../systems/GameSession";
import { SceneFlow, SCENES } from "../systems/SceneFlow";
import { registerRunnerObstacleCollision } from "./registerRunnerObstacleCollision";

const PLAYER_TEXTURE_KEY = "runner-player";
const OBSTACLE_TEXTURE_KEY = "runner-obstacle";
const GROUND_TEXTURE_KEY = "runner-ground";
const BACKDROP_TEXTURE_KEY = "runner-backdrop";
const ROAD_DASH_TEXTURE_KEY = "runner-road-dash";

const PLAYER_X = 180;
const GROUND_HEIGHT = 90;
const GROUND_TOP = GAME_HEIGHT - GROUND_HEIGHT;
const PLAYER_WIDTH = 56;
const PLAYER_HEIGHT = 128;
const OBSTACLE_WIDTH = 68;
const OBSTACLE_HEIGHT = 124;
const WORLD_GRAVITY = 980;
const MIN_SPAWN_DELAY_MS = 1500;
const MAX_SPAWN_DELAY_MS = 2100;

export class RunnerScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey?: Phaser.Input.Keyboard.Key;
  private player?: Phaser.Physics.Arcade.Sprite;
  private ground?: Phaser.Physics.Arcade.Image;
  private obstacles?: Phaser.Physics.Arcade.Group;
  private roadDash?: Phaser.GameObjects.TileSprite;
  private spawnEvent?: Phaser.Time.TimerEvent;
  private obstacleHudText?: Phaser.GameObjects.Text;
  private obstaclesDodged = 0;
  private obstaclesSpawned = 0;
  private currentSpeed = 0;
  private stageComplete = false;
  private ended = false;

  constructor() {
    super(SCENES.runner);
  }

  create(): void {
    gameSession.setStage("runner");
    this.obstaclesDodged = 0;
    this.obstaclesSpawned = 0;
    this.currentSpeed = stageContent.runner.scrollSpeed;
    this.stageComplete = false;
    this.ended = false;

    this.physics.world.gravity.y = WORLD_GRAVITY;

    this.createTextures();
    this.createBackdrop();
    this.createTrack();
    this.createPlayer();
    this.createObstacles();
    this.createHud();
    this.bindInput();
    this.scheduleNextSpawn();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanup();
    });
  }

  update(_time: number, delta: number): void {
    if (!this.player || this.ended) {
      return;
    }

    if (this.stageComplete) {
      this.player.setVelocityX(0);
      return;
    }

    this.currentSpeed +=
      stageContent.runner.scrollAcceleration * (delta / 1000);
    this.player.setMaxVelocity(this.currentSpeed, 900);
    this.roadDash &&
      (this.roadDash.tilePositionX += this.currentSpeed * (delta / 1000));
    this.recycleObstacles();

    if (this.shouldJump()) {
      this.player.setVelocityY(stageContent.runner.jumpVelocity);
    }
  }

  private createTextures(): void {
    if (!this.textures.exists(BACKDROP_TEXTURE_KEY)) {
      const sky = this.add.graphics();
      sky.fillGradientStyle(0xfff6fb, 0xfff6fb, 0xffd9e8, 0xffd9e8, 1);
      sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      sky.fillStyle(0xffffff, 0.7);
      sky.fillEllipse(760, 88, 88, 88);
      sky.fillStyle(0xf8bfd1, 1);
      sky.fillCircle(140, 98, 36);
      sky.fillCircle(190, 82, 26);
      sky.fillCircle(228, 101, 30);
      sky.generateTexture(BACKDROP_TEXTURE_KEY, GAME_WIDTH, GAME_HEIGHT);
      sky.destroy();
    }

    if (!this.textures.exists(GROUND_TEXTURE_KEY)) {
      const ground = this.add.graphics();
      ground.fillStyle(0xf3a9bc, 1);
      ground.fillRect(0, 0, GAME_WIDTH, GROUND_HEIGHT);
      ground.fillStyle(0xe58da6, 1);
      ground.fillRect(0, 0, GAME_WIDTH, 12);
      ground.generateTexture(GROUND_TEXTURE_KEY, GAME_WIDTH, GROUND_HEIGHT);
      ground.destroy();
    }

    if (!this.textures.exists(ROAD_DASH_TEXTURE_KEY)) {
      const dash = this.add.graphics();
      dash.fillStyle(0xffedf3, 1);
      dash.fillRect(0, 0, 70, 6);
      dash.generateTexture(ROAD_DASH_TEXTURE_KEY, 120, 6);
      dash.destroy();
    }
  }

  private createBackdrop(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, BACKDROP_TEXTURE_KEY);

    this.add.text(48, 34, "Final Round", {
      color: "#7a284b",
      fontSize: "32px",
      fontStyle: "bold",
    });
  }

  private createTrack(): void {
    this.ground = this.physics.add.staticImage(
      GAME_WIDTH / 2,
      GAME_HEIGHT - GROUND_HEIGHT / 2,
      GROUND_TEXTURE_KEY,
    );
    this.ground.refreshBody();

    this.roadDash = this.add
      .tileSprite(0, GROUND_TOP + 18, GAME_WIDTH, 6, ROAD_DASH_TEXTURE_KEY)
      .setOrigin(0, 0.5);
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(
      PLAYER_X,
      GROUND_TOP - PLAYER_HEIGHT / 2,
      PLAYER_TEXTURE_KEY,
    );
    this.player.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setMaxVelocity(stageContent.runner.scrollSpeed, 900);

    if (this.ground) {
      this.physics.add.collider(this.player, this.ground);
    }
  }

  private createObstacles(): void {
    this.obstacles = this.physics.add.group({
      classType: RunnerObstacle,
      maxSize: 8,
      runChildUpdate: false,
    });

    registerRunnerObstacleCollision(
      this.physics,
      this.player!,
      this.obstacles,
      () => {
        this.failRun();
      },
    );
  }

  private createHud(): void {
    this.obstacleHudText = this.add
      .text(GAME_WIDTH / 2, 34, this.formatObstacles(), {
        color: "#7a284b",
        fontSize: "28px",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);
  }

  private bindInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.jumpKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  private scheduleNextSpawn(): void {
    if (this.ended || this.stageComplete) {
      return;
    }

    const delay = Phaser.Math.Between(MIN_SPAWN_DELAY_MS, MAX_SPAWN_DELAY_MS);
    this.spawnEvent = this.time.addEvent({
      delay,
      callback: () => {
        this.spawnObstacle();
        this.scheduleNextSpawn();
      },
    });
  }

  private spawnObstacle(): void {
    if (!this.obstacles || this.stageComplete || this.ended) {
      return;
    }

    if (this.obstaclesSpawned >= stageContent.runner.goalObstacles) {
      return;
    }

    const obstacle = this.obstacles.get(
      GAME_WIDTH + OBSTACLE_WIDTH,
      GROUND_TOP - OBSTACLE_HEIGHT / 2,
      OBSTACLE_TEXTURE_KEY,
    ) as RunnerObstacle | null;

    if (!obstacle) {
      return;
    }

    obstacle.setTexture(OBSTACLE_TEXTURE_KEY);
    obstacle.setDisplaySize(OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
    obstacle.launch(
      GAME_WIDTH + Phaser.Math.Between(20, 120),
      GROUND_TOP - OBSTACLE_HEIGHT / 2,
      -this.currentSpeed,
    );
    this.obstaclesSpawned++;
  }

  private recycleObstacles(): void {
    for (const child of this.obstacles?.getChildren() ?? []) {
      const obstacle = child as RunnerObstacle;
      if (obstacle.active && obstacle.x < -OBSTACLE_WIDTH) {
        obstacle.park(-OBSTACLE_WIDTH, GROUND_TOP - OBSTACLE_HEIGHT / 2);
        this.obstaclesDodged++;
        this.obstacleHudText?.setText(this.formatObstacles());

        if (this.obstaclesDodged >= stageContent.runner.goalObstacles) {
          this.completeRun();
        }
      }
    }
  }

  private shouldJump(): boolean {
    const body = this.player?.body as Phaser.Physics.Arcade.Body | undefined;
    const upPressed = this.wasJustPressed(this.cursors?.up);
    const spacePressed = this.wasJustPressed(this.jumpKey);

    return Boolean(
      (body?.blocked.down || body?.touching.down) &&
      (upPressed || spacePressed),
    );
  }

  private completeRun(): void {
    if (this.stageComplete || this.ended) {
      return;
    }

    this.stageComplete = true;
    this.spawnEvent?.remove(false);
    this.spawnEvent = undefined;

    this.obstacles?.children.each((child) => {
      const obstacle = child as RunnerObstacle;
      obstacle.setVelocity(0, 0);
      return true;
    });

    this.time.delayedCall(1200, () => {
      this.continueToEnding();
    });
  }

  private continueToEnding(): void {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.cleanup();
    SceneFlow.goTo(this, "ending");
  }

  private failRun(): void {
    if (this.ended || this.stageComplete) {
      return;
    }

    this.ended = true;
    this.cleanup();
    SceneFlow.loseRun(this);
  }

  private cleanup(): void {
    this.spawnEvent?.remove(false);
    this.spawnEvent = undefined;
  }

  private formatObstacles(): string {
    return `Gemini: ${this.obstaclesDodged} / ${stageContent.runner.goalObstacles}`;
  }

  private wasJustPressed(key?: Phaser.Input.Keyboard.Key): boolean {
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }
}
