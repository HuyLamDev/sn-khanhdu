import { QUIZ_QUESTION_COUNT } from '../game/config/stageConfig';

export type QuizQuestion = {
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const questions: QuizQuestion[] = [
  {
    prompt: 'Sinh nhật của Thái Lê Minh Hiếu?',
    choices: ['28/06/2002', '19/07/2002', '27/06/2002', '28/04/2002'],
    correctIndex: 2,
  },
  {
    prompt: 'Xu hướng tính dục Thái Lê Minh Hiếu?',
    choices: ['Les', 'Straight', 'Omega', 'Gay'],
    correctIndex: 3,
  },
  {
    prompt: 'Thái Lê Minh Hiếu học trường gì?',
    choices: ['UEF', 'FPT', 'Hutech', 'UEH'],
    correctIndex: 2,
  },
  {
    prompt: 'Tên ig của Thái Lê Minh Hiếu?',
    choices: ['hieuthuhai', 'hieu_hihi', '_hieu_hihi', '_hieu.hihi'],
    correctIndex: 2,
  },
  {
    prompt: 'Thái Lê Minh Hiếu hay Hùng Huỳnh?',
    choices: ['Hùng Huỳnh', 'Gemini Hùng Huỳnh', 'Hùng Huỳnh Gemini', 'Thái Lê Minh Hiếu'],
    correctIndex: 3,
  },
];

if (questions.length !== QUIZ_QUESTION_COUNT) {
  throw new Error(
    `Expected ${QUIZ_QUESTION_COUNT} quiz questions, received ${questions.length}.`,
  );
}
