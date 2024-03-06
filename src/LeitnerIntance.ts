import { LeitnerColl } from '@/models/LeitnerColl';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';

const BOX_A_PROB: number = 0.8;
const BOX_LIMIT: number = 50;

interface LeitnerInstance {
  boxA: Array<Puzzle>;
  boxB: Array<Puzzle>;
}

const findLeitner = async (
  user: User
): Promise<LeitnerInstance | undefined> => {
  const leitner = await LeitnerColl.findOne({ username: user.username });
  return leitner ? { boxA: leitner.boxA, boxB: leitner.boxB } : undefined;
};

const booleanWithProbability = (probability: number): boolean => {
  return Math.random() < probability;
};

export const nextReview = ({
  boxA,
  boxB,
}: LeitnerInstance): Puzzle | undefined => {
  const tryBoxA = booleanWithProbability(BOX_A_PROB);
  const lastA = boxA.length > 0 ? boxA[boxA.length - 1] : undefined;
  const lastB = boxB.length > 0 ? boxB[boxB.length - 1] : undefined;
  // The cases where we can do what `tryBoxA` suggests.
  if (tryBoxA && lastA) {
    return lastA;
  } else if (!tryBoxA && lastB) {
    return lastB;
  }
  // Otherwise, at most one box is non-empty - let's pick from it if it exists.
  return lastA || lastB;
};

const filterOutPuzzle = (box: Array<Puzzle>, puzzle: Puzzle): Array<Puzzle> => {
  return box.filter((boxedPuzzle) => boxedPuzzle !== puzzle);
};

const updateIncorrect = (leitner: LeitnerInstance, puzzle: Puzzle): void => {
  // Add to Box A, both when it's not present in a box and when it's in Box B (the latter
  // corresponds to demotion).
  leitner.boxA = [puzzle, ...filterOutPuzzle(leitner.boxA, puzzle)].slice(
    0,
    BOX_LIMIT
  );
  leitner.boxB = filterOutPuzzle(leitner.boxB, puzzle).slice(0, BOX_LIMIT);
};

const updateCorrect = (leitner: LeitnerInstance, puzzle: Puzzle): void => {
  if (leitner.boxA.includes(puzzle)) {
    // Promote to Box B.
    leitner.boxA = filterOutPuzzle(leitner.boxA, puzzle).slice(0, BOX_LIMIT);
    leitner.boxB = [puzzle, ...leitner.boxB].slice(0, BOX_LIMIT);
  } else if (leitner.boxB.includes(puzzle)) {
    // Remove from Leitner entirely.
    leitner.boxB = filterOutPuzzle(leitner.boxB, puzzle).slice(0, BOX_LIMIT);
  } // Else, when not present in Leitner, do nothing.
};

export const updateLeitner = async (
  user: User,
  puzzle: Puzzle,
  correct: boolean
): Promise<void> => {
  const leitner = await findLeitner(user);
  if (!leitner) {
    if (!correct) {
      // We should initialise a default Leitner instance with this puzzle in Box A.
      await LeitnerColl.create({
        username: user.username,
        boxA: [puzzle],
        boxB: [],
      });
    }
    return;
  }
  if (correct) {
    updateCorrect(leitner, puzzle);
  } else {
    updateIncorrect(leitner, puzzle);
  }
  await LeitnerColl.updateOne({ username: user.username }, leitner);
};
