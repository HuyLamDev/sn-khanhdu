export type StoryCard = {
  title: string;
  body: string;
};

export const story = {
  intro: {
    title: 'Princess Rescue',
    body:
      'The prince waits beyond three trials. Answer with heart, cross the maze with courage, and outrun the last stretch before time slips away.',
  },
  quizPrelude:
    'The first trial is memory. The princess must answer what matters most before the castle gates will open.',
  mazePrelude:
    'The second trial is a living maze where charms must be gathered before the hidden path appears.',
  runnerPrelude:
    'The final trial is a desperate sprint through the moonlit road to the prince’s tower.',
  win: {
    title: 'A Happy Reunion',
    body:
      'The princess reaches the prince at last, and the long journey closes in relief, laughter, and a promise to never lose each other again.',
  },
  lose: {
    title: 'The Journey Begins Again',
    body:
      'Time ran out before the princess could finish the trial. She returns to the first page of the story and tries again.',
  },
} satisfies {
  intro: StoryCard;
  quizPrelude: string;
  mazePrelude: string;
  runnerPrelude: string;
  win: StoryCard;
  lose: StoryCard;
};
