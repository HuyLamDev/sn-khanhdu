export type StoryCard = {
  title: string;
  body: string;
};

export const story = {
  intro: {
    title: "Gõ Cửa Trái Tim Hiếu Thái (hư)",
    body: "Hahaha xin chào Khánh Du, đây là tựa game dành cho riêng em. Trong game này em sẽ nhập vai làm một cô công chúa đi giải cứu chàng hoàng tử Thái Lê Minh Hiếu. Để cứu được chàng, em phải vượt qua 3 màn thử thách khác nhau. Chúc em may mắn nhé, Hiếu Thái chờ em! Còn nếu không cứu được Hiếu Thái thì cũng không sao, các anh sẽ cho em một chàng Hiếu Thái khác. Đó là Hiếu Thái Hư - Hiếu Thứ Hai hahaha Ok game on baby nhé!",
  },
  quizPrelude:
    "Phần này sẽ là multiple choice các câu hỏi test kiến thức và mức độ hiểu biết của em về Thiếu Lê Minh Hái. Trả lời không đúng hết thì không đáng mặt đàn ông đâu em nhé!",
  mazePrelude:
    "Ở phần này, em giúp thằng Hiếu Thái collect 3 trái tim mà nó làm rơi trên đường trong lúc bị bắt cóc đi. Em lưu ý cẩn thận, sẽ có kẻ xấu rình rập và cản đường em. Nhiệm vụ của em là tránh kẻ xấu và collect cho anh đủ 3 trái tim nhé!",
  runnerPrelude:
    "Hahaha chào mừng em đã đến Final Round, ở round này em sẽ phải vượt qua các chông gai ở trên đường để đến được toà lâu đài của Hiếu Thái. Chúc em thành công!",
  win: {
    title: "A Happy Reunion",
    body: "The princess reaches the prince at last, and the long journey closes in relief, laughter, and a promise to never lose each other again.",
  },
  lose: {
    title: "The Journey Begins Again",
    body: "Time ran out before the princess could finish the trial. She returns to the first page of the story and tries again.",
  },
} satisfies {
  intro: StoryCard;
  quizPrelude: string;
  mazePrelude: string;
  runnerPrelude: string;
  win: StoryCard;
  lose: StoryCard;
};
