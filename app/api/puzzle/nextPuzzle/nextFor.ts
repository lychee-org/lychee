import { RatingHolder } from '@/components/puzzle-ui/puzzle-mode';
import { AllRoundColl } from '@/models/AllRoundColl';
import { RatingColl } from '@/models/RatingColl';
import { fetchUserRating, getThemeRatings } from '@/rating/getRating';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import mongoose from 'mongoose';
import sm2RandomThemeFromRatingMap from './sm2';
import frequentiallyRandomTheme, { isIrrelevant } from './themeGenerator';
import Rating from '@/rating/GlickoV2Rating';

const LOWER_RADIUS = 200;
const UPPER_RADIUS = 200;
const MAX_REPS = 100;

export type PuzzleWithUserRating = {
  puzzle: Puzzle;
  rating: RatingHolder;
};

const puzzleFromDocument = (document: any): Puzzle => {
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
  fetchUserRating(user).then(async ({ userRating, present }) => {
    if (!present) {
      // TODO(sm3421): move this logic to login.
      RatingColl.create({
        username: user.username,
        rating: userRating.rating,
        ratingDeviation: userRating.ratingDeviation,
        volatility: userRating.volatility,
        numberOfResults: userRating.numberOfResults,
      });
      // NB: This is important. If new user, set solved to be empty.
      AllRoundColl.create({
        username: user.username,
        solved: [],
      });
    }
    
    // NB: The persisted rating map may contain irrelevant themes, but we don't
    // want to include these for nextPuzzle / SM2, so we filter them out below.
    const ratingMap = await getThemeRatings(user, true);

    // TODO: Better handle repeat avoidance.
    const exceptions = (await AllRoundColl.findOne({ username: user.username }))
      ?.solved ?? [];

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
