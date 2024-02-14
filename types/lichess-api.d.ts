export type LichessUser = {
  id: string;
  username: string;
  perfs: {
    chess960: ChessGameStats;
    antichess: ChessGameStats;
    puzzle: ChessGameStats;
    atomic: ChessGameStats;
    racingKings: ChessGameStats;
    racer: {
      runs: number;
      score: number;
    };
    ultraBullet: ChessGameStats;
    blitz: ChessGameStats;
    kingOfTheHill: ChessGameStats;
    crazyhouse: ChessGameStats;
    threeCheck: ChessGameStats;
    streak: {
      runs: number;
      score: number;
    };
    storm: {
      runs: number;
      score: number;
    };
    bullet: ChessGameStats;
    correspondence: ChessGameStats;
    classical: ChessGameStats;
    rapid: ChessGameStats;
  };
  patron: boolean;
  createdAt: number;
  profile: {
    location: string;
    firstName: string;
    flag: string;
    bio: string;
    lastName: string;
    links: string;
  };
  seenAt: number;
  playTime: {
    total: number;
    tv: number;
  };
  url: string;
  count: {
    all: number;
    rated: number;
    ai: number;
    draw: number;
    drawH: number;
    loss: number;
    lossH: number;
    win: number;
    winH: number;
    bookmark: number;
    playing: number;
    import: number;
    me: number;
  };
  followable: boolean;
  following: boolean;
  blocking: boolean;
  followsYou: boolean;
}

export type Puzzle = {
  PuzzleId: string;
  FEN: string;
  Moves: string;
  Rating: number;
  RatingDeviation: number;
  Popularity: number;
  NbPlays: number;
  Themes: string;
  GameUrl: string;
  OpeningTags: string;
}

export type Glicko = {
  r: number
  d: number
  v: number
}