import Phaser from "phaser";
import { stageContent } from "../../content/stages";
import { RunnerObstacle } from "../objects/RunnerObstacle";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/stageConfig";
import { gameSession } from "../systems/GameSession";
import { SceneFlow, SCENES } from "../systems/SceneFlow";
import { TimerSystem } from "../systems/TimerSystem";
import { registerRunnerObstacleCollision } from "./registerRunnerObstacleCollision";

const PLAYER_TEXTURE_KEY = "runner-player";
const OBSTACLE_TEXTURE_KEY = "runner-obstacle";
const GROUND_TEXTURE_KEY = "runner-ground";
const BACKDROP_TEXTURE_KEY = "runner-backdrop";

const PLAYER_X = 180;
const GROUND_HEIGHT = 90;
const GROUND_TOP = GAME_HEIGHT - GROUND_HEIGHT;
const PLAYER_WIDTH = 56;
const PLAYER_HEIGHT = 128;
const OBSTACLE_WIDTH = 68;
const OBSTACLE_HEIGHT = 124;
const WORLD_GRAVITY = 980;
const DISTANCE_SCALE = 0.44;
const MIN_SPAWN_DELAY_MS = 1500;
const MAX_SPAWN_DELAY_MS = 2100;

export class RunnerScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey?: Phaser.Input.Keyboard.Key;
  private continueKey?: Phaser.Input.Keyboard.Key;
  private player?: Phaser.Physics.Arcade.Sprite;
  private ground?: Phaser.Physics.Arcade.Image;
  private obstacles?: Phaser.Physics.Arcade.Group;
  private timer?: TimerSystem;
  private spawnEvent?: Phaser.Time.TimerEvent;
  private distanceText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private continueButton?: Phaser.GameObjects.Text;
  private runnerDistance = 0;
  private currentSpeed = 0;
  private stageComplete = false;
  private ended = false;

  constructor() {
    super(SCENES.runner);
  }

  create(): void {
    gameSession.setStage("runner");
    gameSession.setRunnerDistance(0);
    this.runnerDistance = 0;
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
    this.startTimer();
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
      this.handleContinueInput();
      return;
    }

    this.currentSpeed +=
      stageContent.runner.scrollAcceleration * (delta / 1000);
    this.player.setMaxVelocity(this.currentSpeed, 900);
    this.updateDistance(delta);
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
  }

  private createBackdrop(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, BACKDROP_TEXTURE_KEY);

    this.add.text(48, 34, "Final Trial", {
      color: "#7a284b",
      fontSize: "32px",
      fontStyle: "bold",
    });

    this.add
      .text(GAME_WIDTH - 48, 42, `Goal: ${stageContent.runner.goalDistance}m`, {
        color: "#7a284b",
        fontSize: "24px",
        fontStyle: "bold",
      })
      .setOrigin(1, 0);
  }

  private createTrack(): void {
    this.ground = this.physics.add.staticImage(
      GAME_WIDTH / 2,
      GAME_HEIGHT - GROUND_HEIGHT / 2,
      GROUND_TEXTURE_KEY,
    );
    this.ground.refreshBody();

    for (let x = 0; x < GAME_WIDTH; x += 120) {
      this.add
        .rectangle(x + 40, GROUND_TOP + 18, 70, 6, 0xffedf3)
        .setOrigin(0, 0.5);
    }
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
    this.distanceText = this.add.text(48, 148, this.formatDistance(), {
      color: "#7a284b",
      fontSize: "24px",
      fontStyle: "bold",
    });

    this.statusText = this.add
      .text(GAME_WIDTH / 2, 160, "Jump with Up or Space", {
        color: "#6b5460",
        fontSize: "20px",
      })
      .setOrigin(0.5);
  }

  private bindInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.jumpKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.continueKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );
  }

  private startTimer(): void {
    this.timer = new TimerSystem(this, stageContent.runner.timerSeconds, () => {
      this.failRun();
    });
    this.timer.mount(GAME_WIDTH - 170, 78);
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
  }

  private recycleObstacles(): void {
    for (const child of this.obstacles?.getChildren() ?? []) {
      const obstacle = child as RunnerObstacle;
      if (obstacle.active && obstacle.x < -OBSTACLE_WIDTH) {
        obstacle.park(-OBSTACLE_WIDTH, GROUND_TOP - OBSTACLE_HEIGHT / 2);
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

  private handleContinueInput(): void {
    const upPressed = this.wasJustPressed(this.cursors?.up);
    const spacePressed = this.wasJustPressed(this.jumpKey);
    const enterPressed = this.wasJustPressed(this.continueKey);

    if (upPressed || spacePressed || enterPressed) {
      this.continueToWin();
    }
  }

  private updateDistance(delta: number): void {
    this.runnerDistance = Math.min(
      stageContent.runner.goalDistance,
      this.runnerDistance + this.currentSpeed * (delta / 1000) * DISTANCE_SCALE,
    );

    gameSession.setRunnerDistance(Math.round(this.runnerDistance));
    this.distanceText?.setText(this.formatDistance());

    if (this.runnerDistance >= stageContent.runner.goalDistance) {
      this.completeRun();
    }
  }

  private completeRun(): void {
    if (this.stageComplete || this.ended) {
      return;
    }

    this.stageComplete = true;
    this.timer?.stop();
    this.spawnEvent?.remove(false);
    this.spawnEvent = undefined;

    this.obstacles?.children.each((child) => {
      const obstacle = child as RunnerObstacle;
      obstacle.setVelocity(0, 0);
      return true;
    });

    this.statusText?.setText(
      "The tower gate opens. Press Space, Up, or Enter to continue.",
    );

    this.continueButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Continue To The Prince", {
        backgroundColor: "#f4b6c2",
        color: "#4b1f31",
        fontSize: "28px",
        padding: { x: 18, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.continueButton.on("pointerup", () => {
      this.continueToWin();
    });
  }

  private continueToWin(): void {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.cleanup();
    SceneFlow.goTo(this, "win");
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
    this.timer?.destroy();
    this.timer = undefined;

    this.spawnEvent?.remove(false);
    this.spawnEvent = undefined;

    this.continueButton?.removeAllListeners();
  }

  private formatDistance(): string {
    return `Distance: ${Math.round(this.runnerDistance)} / ${stageContent.runner.goalDistance}m`;
  }

  private wasJustPressed(key?: Phaser.Input.Keyboard.Key): boolean {
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }
}
