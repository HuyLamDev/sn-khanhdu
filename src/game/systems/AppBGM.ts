import Phaser from 'phaser';

let bgm: Phaser.Sound.BaseSound | null = null;

export const AppBGM = {
  init(sound: Phaser.Sound.BaseSound): void {
    bgm = sound;
  },

  resume(): void {
    if (bgm && !bgm.isPlaying) bgm.play();
  },

  pause(): void {
    if (bgm?.isPlaying) bgm.pause();
  },
};
