import PuzzleMode from '@/components/puzzle-mode';

export default async function TestBoard() {
  const puzzle1 = {
    PuzzleId: '00sHx',
    FEN: 'q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17',
    Moves: 'e8d7 a2e6 d7d8 f7f8',
    Rating: 1760,
    RatingDeviation: 80,
    Popularity: 83,
    NbPlays: 72,
    Themes: 'mate mateIn2 middlegame short',
    GameUrl: 'https://lichess.org/yyznGmXs/black#34',
    OpeningTags: 'Italian_Game Italian_Game_Classical_Variation',
  };

  const puzzle2 = {
    PuzzleId: '00sO1',
    FEN: '1k1r4/pp3pp1/2p1p3/4b3/P3n1P1/8/KPP2PN1/3rBR1R b - - 2 31',
    Moves: 'b8c7 e1a5 b7b6 f1d1',
    Rating: 998,
    RatingDeviation: 85,
    Popularity: 94,
    NbPlays: 293,
    Themes: 'advantage discoveredAttack master middlegame short',
    GameUrl: 'https://lichess.org/vsfFkG0s/black#62',
    OpeningTags: '',
  };

  return <PuzzleMode puzzles={[puzzle1, puzzle2]} />; // TODO(sm3421): This is stupid.
}
