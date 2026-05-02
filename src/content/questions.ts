import { QUIZ_QUESTION_COUNT } from '../game/config/stageConfig';

export type QuizQuestion = {
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const questions: QuizQuestion[] = [
  {
    prompt: 'Which flower should the princess carry to remember the prince?',
    choices: ['Rose', 'Lily', 'Sunflower', 'Violet'],
    correctIndex: 0,
  },
  {
    prompt: 'Which time of day best matches their storybook walks together?',
    choices: ['Dawn', 'Noon', 'Sunset', 'Midnight'],
    correctIndex: 2,
  },
  {
    prompt: 'What gift would the princess protect first on the journey?',
    choices: ['A ribbon', 'A letter', 'A crown', 'A lantern'],
    correctIndex: 1,
  },
  {
    prompt: 'Which sound helps the princess stay brave in the maze?',
    choices: ['Birdsong', 'Rainfall', 'Laughter', 'Silence'],
    correctIndex: 2,
  },
  {
    prompt: 'What promise keeps the princess running toward the final gate?',
    choices: ['To be kind', 'To return home', 'To reunite at last', 'To be free'],
    correctIndex: 2,
  },
];

if (questions.length !== QUIZ_QUESTION_COUNT) {
  throw new Error(
    `Expected ${QUIZ_QUESTION_COUNT} quiz questions, received ${questions.length}.`,
  );
}
