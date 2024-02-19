import { RatingHolder } from '@/components/puzzle-ui/puzzle-mode';
import { AllRoundColl } from '@/models/AllRoundColl';
import { getExistingUserRating, getThemeRatings } from '@/src/rating/getRating';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import mongoose from 'mongoose';
import sm2RandomThemeFromRatingMap from '../../../../src/sm2';
import frequentiallyRandomTheme, { isIrrelevant } from './themeGenerator';
import Rating from '@/src/rating/GlickoV2Rating';

export const LOWER_RADIUS = 200;
export const UPPER_RADIUS = 200;

const MAX_REPS = 100;

export type PuzzleWithUserRating = {
  puzzle: Puzzle;
  rating: RatingHolder;
};

export const getUserSolvedPuzzleIDs = async (user: User): Promise<string[]> => {
  const doc = await AllRoundColl.findOne({ username: user.username })
  if (!doc) {
    throw new Error("AllRound collection not populated with user, should happen on first login");
  }
  return doc.solved;
}

export const puzzleFromDocument = (document: any): Puzzle => {
  let { _id: _, ...rest } = document;
  return rest as any as Puzzle;
};

const nextPuzzleForThemeAndRating = async (
  theme: string,
  rating: number,
  exceptions: any
): Promise<Puzzle | undefined> => {
  const p = await mongoose.connection.collection('testPuzzles').findOne({
    PuzzleId: { $nin: exceptions },
    Rating: {
      $gt: rating - LOWER_RADIUS,
      $lt: rating + UPPER_RADIUS,
    },
    // TODO: Improve this. Maybe transform testPuzzles to not have this annoying
    // space-separated string of themes?
    Themes: { $regex: new RegExp('\\b' + theme + '\\b', 'i') },
  });
  if (p === null) {
    return undefined;
  }
  return puzzleFromDocument(p);
};

const nextPuzzleRepetitions = async (
  rating: number,
  reps: number,
  ratingMap: Map<string, Rating>,
  exceptions: any
): Promise<Puzzle> => {
  if (reps == MAX_REPS) {
    throw new Error('Maximum repetitions reached... something is wrong.');
  }
  let theme = frequentiallyRandomTheme();
  // If the theme is not in the rating map, let's try to use it.
  // Otherwise, let's run probabilistic SM2 on the rating map.
  const useSpacedRep = ratingMap.has(theme);
  if (useSpacedRep) {
    theme = sm2RandomThemeFromRatingMap(ratingMap);
  }
  const p = await nextPuzzleForThemeAndRating(theme, rating, exceptions);
  if (p) {
    if (isIrrelevant(theme)) {
      throw new Error("Irrelevant theme found - incorrect or no filtering has occured.");
    }
    console.log(`Found theme ${theme} ${useSpacedRep ? 'through SM2' : 'frequentially'} after ${reps} reps.`);
    return p;
  }
  return await nextPuzzleRepetitions(rating, reps + 1, ratingMap, exceptions);
};

const nextPuzzleFor = async (user: User): Promise<PuzzleWithUserRating> =>
  getExistingUserRating(user).then(async (userRating) => {
    // NB: The persisted rating map may contain irrelevant themes, but we don't
    // want to include these for nextPuzzle / SM2, so we filter them out below.
    const ratingMap = await getThemeRatings(user, true);
    // TODO: Iterate to better handle repeat avoidance.
    const exceptions: string[] = await getUserSolvedPuzzleIDs(user);
    console.log(exceptions);
    const puzzle = await nextPuzzleRepetitions(
      userRating.rating,
      0,
      ratingMap,
      exceptions
    );
    console.log(
      `Got puzzle with themes ${puzzle.Themes} and rating ${puzzle.Rating} and line ${puzzle.Moves}`
    );
    return {
      puzzle: puzzle,
      rating: {
        rating: userRating.rating,
        ratingDeviation: userRating.ratingDeviation,
        volatility: userRating.volatility,
        numberOfResults: userRating.numberOfResults,
      },
    };
  });

export default nextPuzzleFor;
