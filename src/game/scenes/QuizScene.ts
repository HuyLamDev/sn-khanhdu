import Phaser from 'phaser';
import { questions } from '../../content/questions';
import { stageContent } from '../../content/stages';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/stageConfig';
import { gameSession } from '../systems/GameSession';
import { SCENES, SceneFlow } from '../systems/SceneFlow';
import { TimerSystem } from '../systems/TimerSystem';

const PANEL_STYLE = {
  fillColor: 0xfff7fa,
  fillAlpha: 0.96,
  strokeColor: 0xe7b5c7,
  strokeWidth: 3,
};

const BODY_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  color: '#4b2436',
  fontSize: '22px',
  wordWrap: { width: 640 },
};

const MUTED_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  color: '#6d5461',
  fontSize: '16px',
  wordWrap: { width: 800 },
};

// Buttons use a fixed size so all four cells are identical.
// padding y:14 vertically centers a single line of 20px text within btnH 52px.
const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  align: 'center',
  backgroundColor: '#f4b6c2',
  color: '#4b1f31',
  fontSize: '20px',
  padding: { x: 14, y: 14 },
  wordWrap: { width: 312 },
};

// All layout positions in logical pixels (960×540 canvas).
// Panel: 880×500, center y=270  →  top=20, bottom=520
const L = {
  panelCy:  270,
  panelW:   880,
  panelH:   500,
  titleY:    50,
  preludeY:  88,
  questionY: 168,
  gridRow0:  278,
  gridRow1:  348,
  gridCol0:  GAME_WIDTH / 2 - 183,   // 297
  gridCol1:  GAME_WIDTH / 2 + 183,   // 663
  btnW:      340,
  btnH:       52,
  feedbackY: 410,
  continueY: 458,
  counterY:  500,   // bottom strip: question progress left, score right
  counterX:  100,
  scoreX:    GAME_WIDTH - 100,
  instructionY: GAME_HEIGHT - 8,
};

export class QuizScene extends Phaser.Scene {
  private questionIndex = 0;
  private score = 0;
  private timer?: TimerSystem;
  private questionCounterText?: Phaser.GameObjects.Text;
  private questionText?: Phaser.GameObjects.Text;
  private feedbackText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Text[] = [];
  private continueButton?: Phaser.GameObjects.Text;

  constructor() {
    super(SCENES.quiz);
  }

  create(): void {
    gameSession.setStage('quiz');
    gameSession.setQuizScore(0);
    this.questionIndex = 0;
    this.score = 0;

    this.add
      .rectangle(GAME_WIDTH / 2, L.panelCy, L.panelW, L.panelH, PANEL_STYLE.fillColor, PANEL_STYLE.fillAlpha)
      .setStrokeStyle(PANEL_STYLE.strokeWidth, PANEL_STYLE.strokeColor);

    this.add
      .text(GAME_WIDTH / 2, L.titleY, 'Quiz Trial', {
        color: '#7a284b',
        fontSize: '32px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.timer = new TimerSystem(this, stageContent.quiz.timerSeconds, () => {
      SceneFlow.loseRun(this);
    });
    this.timer.mount(GAME_WIDTH - 154, 26);

    this.questionText = this.add
      .text(GAME_WIDTH / 2, L.questionY, '', {
        ...BODY_TEXT_STYLE,
        fontSize: '26px',
        fontStyle: 'bold',
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(GAME_WIDTH / 2, L.feedbackY, '', {
        color: '#7a284b',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.instructionText = this.add
      .text(GAME_WIDTH / 2, L.instructionY, 'Pick one answer before the timer reaches zero.', MUTED_TEXT_STYLE)
      .setOrigin(0.5);

    // Counter and score sit at the bottom of the panel.
    this.questionCounterText = this.add
      .text(L.counterX, L.counterY, '', {
        color: '#7a284b',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    this.scoreText = this.add
      .text(L.scoreX, L.counterY, '', {
        color: '#7a284b',
        fontSize: '18px',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.timer?.destroy();
      this.timer = undefined;
    });

    this.renderQuestion();
  }

  private renderQuestion(): void {
    const question = questions[this.questionIndex];

    this.clearChoices();
    this.continueButton?.destroy();
    this.continueButton = undefined;

    this.questionCounterText?.setText(`Question ${this.questionIndex + 1} / ${questions.length}`);
    this.scoreText?.setText(`Score: ${this.score}`);
    this.questionText?.setText(question.prompt);
    this.feedbackText?.setText('');
    this.instructionText?.setText('Pick one answer before the timer reaches zero.');

    const colX = [L.gridCol0, L.gridCol1];
    const rowY = [L.gridRow0, L.gridRow1];

    question.choices.forEach((choice, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      const button = this.add
        .text(colX[col], rowY[row], choice, BUTTON_STYLE)
        .setOrigin(0.5)
        .setFixedSize(L.btnW, L.btnH)
        .setInteractive({ useHandCursor: true });

      button.on('pointerup', () => {
        this.answerQuestion(index);
      });

      this.choiceButtons.push(button);
    });
  }

  private answerQuestion(choiceIndex: number): void {
    const question = questions[this.questionIndex];
    const isCorrect = choiceIndex === question.correctIndex;

    this.choiceButtons.forEach((button, index) => {
      button.disableInteractive();

      if (index === question.correctIndex) {
        button.setStyle({ backgroundColor: '#cfe9c8', color: '#214a2a' });
      } else if (index === choiceIndex) {
        button.setStyle({ backgroundColor: '#f5c4c8', color: '#6a1d28' });
      }
      // Re-apply fixed size in case setStyle reset it.
      button.setFixedSize(L.btnW, L.btnH);
    });

    if (isCorrect) {
      this.score += 1;
      gameSession.setQuizScore(this.score);
      this.feedbackText?.setText('Correct. The gate remembers that answer.');
    } else {
      this.feedbackText?.setText(
        `Not quite. The true answer was "${question.choices[question.correctIndex]}".`,
      );
    }

    this.scoreText?.setText(`Score: ${this.score}`);
    this.instructionText?.setText('Continue when you are ready.');

    const isLastQuestion = this.questionIndex === questions.length - 1;
    const label = isLastQuestion ? 'Continue To Maze' : 'Next Question';

    this.continueButton = this.add
      .text(GAME_WIDTH / 2, L.continueY, label, {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '22px',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.continueButton.on('pointerup', () => {
      if (isLastQuestion) {
        this.showQuizComplete();
        return;
      }

      this.questionIndex += 1;
      this.renderQuestion();
    });
  }

  private showQuizComplete(): void {
    this.timer?.stop();
    this.clearChoices();
    this.continueButton?.destroy();
    this.continueButton = undefined;

    this.questionCounterText?.setText('Quiz Complete');
    this.questionText?.setText(
      `The princess answered ${this.score} of ${questions.length} questions correctly.`,
    );
    this.feedbackText?.setText('The first gate opens. The maze waits beyond it.');
    this.instructionText?.setText('Step forward to begin the second trial.');

    this.continueButton = this.add
      .text(GAME_WIDTH / 2, L.continueY, 'Enter The Maze', {
        backgroundColor: '#f4b6c2',
        color: '#4b1f31',
        fontSize: '22px',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.continueButton.on('pointerup', () => {
      SceneFlow.goTo(this, 'maze');
    });
  }

  private clearChoices(): void {
    this.choiceButtons.forEach((button) => {
      button.destroy();
    });
    this.choiceButtons = [];
  }
}
