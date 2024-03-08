import { isIrrelevant } from '@/app/api/puzzle/nextPuzzle/themeGenerator';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import base64url from 'base64url';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  // Capitalize the first letter of a string. And add spaces as word is camel case
  s = s.replace(/([A-Z])/g, ' $1');
  if (s.includes('mate')) {
    s = s.replace(/([1-9])/g, ' $1');
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const booleanWithProbability = (probability: number): boolean => {
  return Math.random() < probability;
};

// TODO: Reduce duplication here.
export const allThemes = [
  'advancedPawn',
  'advantage',
  'anastasiaMate',
  'arabianMate',
  'attackingF2F7',
  'attraction',
  'backRankMate',
  'bishopEndgame',
  'bodenMate',
  'capturingDefender',
  'castling',
  'clearance',
  'crushing',
  'defensiveMove',
  'deflection',
  'discoveredAttack',
  'doubleBishopMate',
  'doubleCheck',
  'dovetailMate',
  'enPassant',
  'endgame',
  'equality',
  'exposedKing',
  'fork',
  'hangingPiece',
  'hookMate',
  'interference',
  'intermezzo',
  'kingsideAttack',
  'knightEndgame',
  'long',
  'master',
  'masterVsMaster',
  'mate',
  'mateIn1',
  'mateIn2',
  'mateIn3',
  'mateIn4',
  'mateIn5',
  'middlegame',
  'oneMove',
  'opening',
  'pawnEndgame',
  'pin',
  'promotion',
  'queenEndgame',
  'queenRookEndgame',
  'queensideAttack',
  'quietMove',
  'rookEndgame',
  'sacrifice',
  'short',
  'skewer',
  'smotheredMate',
  'superGM',
  'trappedPiece',
  'underPromotion',
  'veryLong',
  'xRayAttack',
  'zugzwang',
];

export const relevantThemes = allThemes.filter(isIrrelevant);

export function toGroupId(s: string[]) {
  // convert list of theme names into id by turning into ids and joining with '-'
  // sort all themes so that the id is unique
  try {
    s.sort();
    s = s.filter((x) => allThemes.includes(x as any));
    let idString = s.map((x) => allThemes.indexOf(x)).join('-');
    return base64url.encode(idString);
  } catch (e) {
    return '-1';
  }
}

export function toGroup(s: string) {
  // convert id to list of theme names
  try {
    s = base64url.decode(s);
    const idxs = s.split('-').map((x) => parseInt(x));
    return idxs.filter((x) => !isNaN(x)).map((x) => allThemes[x]);
  } catch (e) {
    return [];
  }
}
