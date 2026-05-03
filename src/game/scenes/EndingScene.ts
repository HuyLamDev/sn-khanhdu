import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../config/stageConfig";
import { gameSession } from "../systems/GameSession";
import { SceneFlow, SCENES } from "../systems/SceneFlow";

const PLAYER_TEXTURE_KEY = "runner-player";
const CASTLE_TEXTURE_KEY = "ending-castle";
const GROUND_TEXTURE_KEY = "runner-ground";
const BACKDROP_TEXTURE_KEY = "runner-backdrop";

const GROUND_HEIGHT = 90;
const GROUND_TOP = GAME_HEIGHT - GROUND_HEIGHT;
const PLAYER_WIDTH = 56;
const PLAYER_HEIGHT = 128;
const PLAYER_START_X = 80;
const PLAYER_Y = GROUND_TOP - PLAYER_HEIGHT / 2;

const CASTLE_X = 800;
const CASTLE_DISPLAY_WIDTH = 210;
const CASTLE_DISPLAY_HEIGHT = 320;
const CASTLE_ARRIVE_X = CASTLE_X - 50;

const RUN_DURATION = 2600;
const PAUSE_AFTER_ARRIVE_MS = 1500;

export class EndingScene extends Phaser.Scene {
  constructor() {
    super(SCENES.ending);
  }

  create(): void {
    gameSession.setStage("ending");

    this.createBackground();
    const castle = this.createCastle();
    const player = this.createPlayer();
    this.playAnimation(player, castle);
  }

  private createBackground(): void {
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
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, BACKDROP_TEXTURE_KEY);

    if (!this.textures.exists(GROUND_TEXTURE_KEY)) {
      const ground = this.add.graphics();
      ground.fillStyle(0xf3a9bc, 1);
      ground.fillRect(0, 0, GAME_WIDTH, GROUND_HEIGHT);
      ground.fillStyle(0xe58da6, 1);
      ground.fillRect(0, 0, GAME_WIDTH, 12);
      ground.generateTexture(GROUND_TEXTURE_KEY, GAME_WIDTH, GROUND_HEIGHT);
      ground.destroy();
    }
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - GROUND_HEIGHT / 2, GROUND_TEXTURE_KEY);

    for (let x = 0; x < GAME_WIDTH; x += 120) {
      this.add.rectangle(x + 40, GROUND_TOP + 18, 70, 6, 0xffedf3).setOrigin(0, 0.5);
    }
  }

  private createCastle(): Phaser.GameObjects.Image {
    return this.add
      .image(CASTLE_X, GROUND_TOP, CASTLE_TEXTURE_KEY)
      .setOrigin(0.5, 1)
      .setDisplaySize(CASTLE_DISPLAY_WIDTH, CASTLE_DISPLAY_HEIGHT);
  }

  private createPlayer(): Phaser.GameObjects.Image {
    return this.add
      .image(PLAYER_START_X, PLAYER_Y, PLAYER_TEXTURE_KEY)
      .setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  private playAnimation(
    player: Phaser.GameObjects.Image,
    castle: Phaser.GameObjects.Image,
  ): void {
    this.tweens.add({
      targets: player,
      x: CASTLE_ARRIVE_X,
      duration: RUN_DURATION,
      ease: "Linear",
      onComplete: () => {
        player.setVisible(false);
        castle.setDepth(1);
        this.time.delayedCall(PAUSE_AFTER_ARRIVE_MS, () => {
          SceneFlow.goTo(this, "win");
        });
      },
    });
  }
}
