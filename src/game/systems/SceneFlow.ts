import Phaser from "phaser";
import { story } from "../../content/story";
import type { StageKey } from "./GameSession";
import { gameSession } from "./GameSession";

export const SCENES = {
  boot: "BootScene",
  intro: "IntroScene",
  stageIntro: "StageIntroScene",
  quiz: "QuizScene",
  maze: "MazeScene",
  runner: "RunnerScene",
  ending: "EndingScene",
  win: "WinScene",
  lose: "LoseScene",
} as const;

export type GameplayStage = "quiz" | "maze" | "runner";

export type StageIntroData = {
  stage: GameplayStage;
  title: string;
  preludeText: string;
  soundKey: string;
};

const GAMEPLAY_STAGES: readonly GameplayStage[] = ["quiz", "maze", "runner"];

const STAGE_INTRO_DATA: Record<GameplayStage, StageIntroData> = {
  quiz: {
    stage: "quiz",
    title: "Kiểm Tra Kiến Thức ",
    preludeText: story.quizPrelude,
    soundKey: "round1",
  },
  maze: {
    stage: "maze",
    title: "Mê Cung Tình Yêu",
    preludeText: story.mazePrelude,
    soundKey: "round2",
  },
  runner: {
    stage: "runner",
    title: "Em Du Vượt Ngàn Say Hi ",
    preludeText: story.runnerPrelude,
    soundKey: "round3",
  },
};

const STAGE_TO_SCENE: Record<StageKey, string> = {
  intro: SCENES.intro,
  quiz: SCENES.quiz,
  maze: SCENES.maze,
  runner: SCENES.runner,
  ending: SCENES.ending,
  win: SCENES.win,
  lose: SCENES.lose,
};

function isGameplayStage(stage: StageKey): stage is GameplayStage {
  return (GAMEPLAY_STAGES as readonly string[]).includes(stage);
}

export const SceneFlow = {
  goTo(scene: Phaser.Scene, stage: StageKey): void {
    if (isGameplayStage(stage)) {
      SceneFlow.goToIntro(scene, stage);
      return;
    }
    gameSession.setStage(stage);
    scene.scene.start(STAGE_TO_SCENE[stage]);
  },

  goToIntro(scene: Phaser.Scene, stage: GameplayStage): void {
    scene.scene.start(SCENES.stageIntro, STAGE_INTRO_DATA[stage]);
  },

  launchGameplay(scene: Phaser.Scene, stage: GameplayStage): void {
    gameSession.setStage(stage);
    scene.scene.start(STAGE_TO_SCENE[stage]);
  },

  restartJourney(scene: Phaser.Scene): void {
    gameSession.reset();
    scene.scene.start(SCENES.intro);
  },

  loseRun(scene: Phaser.Scene): void {
    const stage = gameSession.getState().currentStage as GameplayStage;
    SceneFlow.goToIntro(scene, stage);
  },
};
