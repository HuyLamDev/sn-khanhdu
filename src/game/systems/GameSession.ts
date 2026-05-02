export type StageKey = 'intro' | 'quiz' | 'maze' | 'runner' | 'win' | 'lose';

export type GameSessionState = {
  currentStage: StageKey;
  quizScore: number;
  mazeCollected: number;
  runnerDistance: number;
};

const createInitialState = (): GameSessionState => ({
  currentStage: 'intro',
  quizScore: 0,
  mazeCollected: 0,
  runnerDistance: 0,
});

export class GameSession {
  private state: GameSessionState = createInitialState();

  getState(): Readonly<GameSessionState> {
    return this.state;
  }

  setStage(currentStage: StageKey): void {
    this.state = { ...this.state, currentStage };
  }

  setQuizScore(quizScore: number): void {
    this.state = { ...this.state, quizScore };
  }

  setMazeCollected(mazeCollected: number): void {
    this.state = { ...this.state, mazeCollected };
  }

  setRunnerDistance(runnerDistance: number): void {
    this.state = { ...this.state, runnerDistance };
  }

  reset(): void {
    this.state = createInitialState();
  }
}

export const gameSession = new GameSession();
