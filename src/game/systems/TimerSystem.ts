import Phaser from 'phaser';

const TIMER_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  color: '#7a284b',
  fontSize: '24px',
  fontStyle: 'bold',
};

export class TimerSystem {
  private readonly scene: Phaser.Scene;
  private readonly totalSeconds: number;
  private readonly onExpire: () => void;
  private remainingSeconds: number;
  private text?: Phaser.GameObjects.Text;
  private event?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, totalSeconds: number, onExpire: () => void) {
    this.scene = scene;
    this.totalSeconds = totalSeconds;
    this.remainingSeconds = totalSeconds;
    this.onExpire = onExpire;
  }

  mount(x = 24, y = 24): void {
    if (!this.text) {
      this.text = this.scene.add.text(x, y, this.format(), TIMER_TEXT_STYLE);
      this.text.setScrollFactor(0);
    }

    this.text.setText(this.format());

    if (!this.event) {
      this.event = this.scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
          this.remainingSeconds -= 1;
          this.text?.setText(this.format());

          if (this.remainingSeconds <= 0) {
            this.stop();
            this.onExpire();
          }
        },
      });
    }
  }

  getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  reset(): void {
    this.remainingSeconds = this.totalSeconds;
    this.text?.setText(this.format());
  }

  stop(): void {
    this.event?.remove(false);
    this.event = undefined;
  }

  destroy(): void {
    this.stop();
    this.text?.destroy();
    this.text = undefined;
  }

  private format(): string {
    return `Time: ${Math.max(this.remainingSeconds, 0)}s`;
  }
}
