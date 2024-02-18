import { RatingHolder } from '@/components/puzzle-ui/puzzle-mode';
import { AllRoundColl } from '@/models/AllRoundColl';
import { RatingColl } from '@/models/RatingColl';
import { fetchUserRating, getThemeRatings } from '@/rating/getRating';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import mongoose from 'mongoose';
import sm2RandomThemeFromRatingMap from './sm2';
import frequentiallyRandomTheme from './themeGenerator';
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
  const original = frequentiallyRandomTheme();
  const mappedRating = ratingMap.get(original);
  // If the theme is not in the rating map, let's try to use it.
  if (!mappedRating) {
    const p = await nextPuzzleForThemeAndRating(original, rating, exceptions);
    if (p) {
      console.log(`Found theme ${original} frequentially after ${reps} reps.`);
      return p;
    }
    return await nextPuzzleRepetitions(rating, reps + 1, ratingMap, exceptions);
  }
  // Otheriwse, let's run probabilistic SM2 on the rating map.
  const theme = sm2RandomThemeFromRatingMap(ratingMap);
  const p = await nextPuzzleForThemeAndRating(theme, rating, exceptions);
  if (p) {
    console.log(`Found theme ${theme} through SM2 after ${reps} reps .`);
    return p;
  }
  return await nextPuzzleRepetitions(rating, reps + 1, ratingMap, exceptions);
};

const nextPuzzleFor = async (user: User): Promise<PuzzleWithUserRating> =>
  fetchUserRating(user).then(async ({ userRating, present }) => {
    if (!present) {
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

    const ratingMap = await getThemeRatings(user);

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

    // const f = new Map<string, number>();
    // for (const [k, v] of Object.entries(frequency)) {
    //   f.set(k, v);
    // }
    // const cnt = new Map<String, number>();
    // for (let i = 0; i < 100000; ++i) {
    //   const t = proportionallyRandomTheme(f);
    //   cnt.set(t, (cnt.get(t) || 0) + 1);
    // }
    // console.log(cnt);

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
