const irrelevantThemes: string[] = [
  'oneMove',
  'short',
  'long',
  'veryLong',
  'mateIn1',
  'mateIn2',
  'mateIn3',
  'mateIn4',
  'mateIn5',
  'equality',
  'advantage',
  'crushing',
  'master',
  'masterVsMaster',
];

const frequencyUnfiltered: { [theme: string]: number } = {
  advantage: 1114122,
  anastasiaMate: 3771,
  arabianMate: 3596,
  attackingF2F7: 21543,
  attraction: 127076,
  backRankMate: 114855,
  bishopEndgame: 43387,
  bodenMate: 1443,
  capturingDefender: 31572,
  castling: 2005,
  clearance: 50730,
  crushing: 1633978,
  defensiveMove: 225694,
  deflection: 156856,
  advancedPawn: 204065,
  discoveredAttack: 209840,
  doubleBishopMate: 1524,
  doubleCheck: 17445,
  dovetailMate: 1803,
  enPassant: 5469,
  endgame: 1711180,
  exposedKing: 100602,
  fork: 535211,
  hangingPiece: 160635,
  hookMate: 5161,
  interference: 14820,
  intermezzo: 53247,
  kingsideAttack: 289540,
  knightEndgame: 27976,
  middlegame: 1787974,
  mate: 915928,
  mateIn1: 358723,
  mateIn2: 432833,
  mateIn3: 105864,
  mateIn4: 15192,
  mateIn5: 3316,
  opening: 210061,
  pawnEndgame: 105522,
  pin: 237755,
  promotion: 76801,
  queenEndgame: 33873,
  queenRookEndgame: 24052,
  queensideAttack: 49786,
  quietMove: 145702,
  rookEndgame: 174835,
  sacrifice: 263423,
  skewer: 81626,
  smotheredMate: 10284,
  superGM: 2293,
  trappedPiece: 54438,
  underPromotion: 673,
  veryLong: 295012,
  xRayAttack: 12669,
  zugzwang: 29968,
};

const irrelevantSet = new Set(irrelevantThemes);

export const isIrrelevant = (theme: string): boolean =>
  irrelevantSet.has(theme);

const frequency = Object.fromEntries(
  Object.entries(frequencyUnfiltered).filter(
    ([theme, _]) => !isIrrelevant(theme)
  )
);

const total = Object.values(frequency).reduce((acc, val) => acc + val, 0);

// TODO(sm3421): Reduce duplication with sm2.ts.
const frequentiallyRandomTheme = (): string => {
  const x = Math.floor(Math.random() * total);
  let offset = 0;
  // Can be optimised with upper_bound binary search.
  for (const [theme, f] of Object.entries(frequency)) {
    offset += f;
    if (x < offset) {
      return theme;
    }
  }
  throw new Error('No theme generated!');
};

export default frequentiallyRandomTheme;
