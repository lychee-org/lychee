import { RatingHolder } from '@/components/puzzle-ui/puzzle-mode';
import { AllRoundColl } from '@/models/AllRoundColl';
import { getExistingUserRating, getThemeRatings } from '@/src/rating/getRating';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import mongoose from 'mongoose';
import sm2RandomThemeFromRatingMap from '../../../../src/sm2';
import frequentiallyRandomTheme, { isIrrelevant } from './themeGenerator';
import Rating from '@/src/rating/GlickoV2Rating';

const MAX_REPS = 20;
const MAX_COMPROMISE = 3;

export type PuzzleWithUserRating = {
  puzzle: Puzzle;
  rating: RatingHolder;
};

export const getUserSolvedPuzzleIDs = async (user: User): Promise<string[]> => {
  const doc = await AllRoundColl.findOne({ username: user.username });
  if (!doc) {
    throw new Error(
      'AllRound collection not populated with user, should happen on first login'
    );
  }
  return doc.solved;
};

export const puzzleFromDocument = (document: any): Puzzle => {
  let { _id: _, ...rest } = document;
  return rest as any as Puzzle;
};

// Clamp rating between 400 and 2700, similar to
// https://github.com/clarkerubber/lila/blob/1651e001c4e2794a6b6804860fc729401a670469/modules/puzzle/src/main/Selector.scala#L63
const clampRating = (glicko: number): number =>
  Math.max(400, Math.min(2700, glicko));

// We compute the radius (`ratingFlex`) as in
// https://github.com/lichess-org/lila/blob/e6ce7245b528035ba9bc6ee37ae34799728cdc19/modules/puzzle/src/main/PuzzlePath.scala#L43
// except, since we don't use paths, we allow for a larger initial radius by compromoie = 1, scaling by a factor of 1/2.
const radiusForRating = (rating: number, compromise: number): number =>
  0.5 * compromise * (100 + Math.abs(1500 - rating) / 4);

const nextPuzzleForThemeAndRating = async (
  theme: string,
  rawRating: number,
  exceptions: any,
  compromise: number = 1
): Promise<Puzzle | undefined> => {
  if (compromise > MAX_COMPROMISE) {
    return undefined;
  }
  const rating = compromise > 1 ? rawRating : clampRating(rawRating);
  const radius = radiusForRating(rating, compromise);
  console.log(`radius = ${radius}, theme = ${theme}, rating = ${rating}`);
  const p = await mongoose.connection.collection('testPuzzles').findOne({
    PuzzleId: { $nin: exceptions },
    Rating: {
      $gt: rating - radius,
      $lt: rating + radius,
    },
    // TODO: Improve this. Maybe transform testPuzzles to not have this annoying
    // space-separated string of themes?
    Themes: { $regex: new RegExp('\\b' + theme + '\\b', 'i') },
  });
  // No puzzle found; increase compromise.
  if (p === null) {
    return await nextPuzzleForThemeAndRating(
      theme,
      rating,
      exceptions,
      compromise + 1
    );
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
    throw new Error('Maximum repetitions reached during puzzle selection');
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
      throw new Error(
        'Irrelevant theme found - incorrect/no filtering has occured.'
      );
    }
    console.log(
      `Found theme ${theme} ${useSpacedRep ? 'through SM2' : 'frequentially'} after ${reps} reps.`
    );
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
