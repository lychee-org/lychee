import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import GameResult from '@/src/rating/GameResult';
import Rating from '@/src/rating/GlickoV2Rating';
import RatingCalculator from '@/src/rating/RatingCalculator';
import { Puzzle } from '@/types/lichess-api';
import { NextRequest } from 'next/server';
import { RatingColl } from '../../../../models/RatingColl';
import {
  getDefaultRating,
  getPuzzleRating,
  getThemeRatings,
} from '@/src/rating/getRating';
import { UserThemeColl } from '@/models/UserThemeColl';
import addRound from './addRound';
import { RatingHistory } from '@/models/RatingHistory';
import { ActivePuzzleColl } from '@/models/ActivePuzzle';
import { updateLeitner, updateThemedLeitner } from '@/src/LeitnerIntance';
import { toGroupId } from '@/lib/utils';
import { TimeThemeColl } from '@/models/TimeThemeColl';
import { CountColl } from '@/models/CountColl';

const REVIEW_SCALING_FACTOR = 0.7;

// If the puzzle was a review, we scale the rating change by 70%.
// We apply this both to user's overrall rating and to theme ratings.
// TODO: This also reduces rating decrease for failed reviews (the idea being
// not to penalise a user being bad at something), but one can argue that
// we should be harsher instead on a failed review.
// TODO: Should we scale the rating deviation and volatility as well? Not
// sure how safe it is to solely scale the rating.
const scaleRatingDelta = (oldRating: number, newGlicko: Rating): void => {
  const delta = newGlicko.rating - oldRating;
  newGlicko.rating = oldRating + REVIEW_SCALING_FACTOR * delta;
};

export async function POST(req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { puzzle_, success_, prv_, themeGroupStr, time } = await req.json();

  // Increment the counter for the user in CountColl:
  await CountColl.updateOne(
    { username: user.username },
    { $inc: { count: 1 } }
  );

  const puzzle = puzzle_ as Puzzle;
  const success = success_ as boolean;
  // NB: we create a new object here, so methods are present.
  const userRating = new Rating(
    prv_.rating,
    prv_.ratingDeviation,
    prv_.volatility,
    prv_.numberOfResults
  );
  const themeGroup = themeGroupStr as string[];
  const group = themeGroup.length > 0 ? toGroupId(themeGroup) : undefined;
  const t = (time as number) / 1000;

  if (success) {
    new RatingCalculator().updateRatings(
      new GameResult(userRating, getPuzzleRating(puzzle))
    );
  } else {
    new RatingCalculator().updateRatings(
      new GameResult(getPuzzleRating(puzzle), userRating)
    );
  }

  // Delete active puzzle, as it is solved.
  const activePuzzle = await ActivePuzzleColl.findOneAndDelete({
    username: user.username,
  });

  if (!activePuzzle) {
    throw new Error('No active puzzle found - something is wrong!');
  }

  // Scale the user's rating.
  if (activePuzzle.isReview) {
    console.log(`New rating without scaling: ${userRating.rating}`);
    scaleRatingDelta(prv_.rating, userRating);
    console.log(`New rating with scaling: ${userRating.rating}`);
  }

  // Update user's rating.
  await RatingColl.updateOne(
    { username: user.username },
    {
      $set: {
        rating: userRating.rating,
        ratingDeviation: userRating.ratingDeviation,
        volatility: userRating.volatility,
        numberOfResults: userRating.numberOfResults,
      },
    }
  );

  await RatingHistory.create({
    username: user.username,
    theme: 'overall',
    rating: userRating.rating,
  });

  await addRound(user, puzzle);

  const reviewee = activePuzzle.isReview
    ? (JSON.parse(activePuzzle.reviewee) as Puzzle)
    : puzzle;

  if (group) {
    await updateThemedLeitner(user, reviewee, success, group, t);
  } else {
    await updateLeitner(user, reviewee, success, t);
  }

  // NB: We don't filter out irrelevant themes here. Even if theme is irrelevant, we compute ratings and
  // persist in the DB, as this information is useful for dashboard analysitcs.
  const ratingMap = await getThemeRatings(user, false);
  // console.log(ratingMap);

  // Update theme ratings.
  const themes = puzzle.Themes.split(' ');
  themes.forEach(async (theme) => {
    const themeRating: Rating = ratingMap.get(theme) || getDefaultRating();
    const oldRating: number = themeRating.rating;

    if (success) {
      new RatingCalculator().updateRatings(
        // NB: We cannot use the same variable for puzzleRating, since it is changed by the updateRatings method.
        new GameResult(themeRating, getPuzzleRating(puzzle))
      );
    } else {
      new RatingCalculator().updateRatings(
        new GameResult(getPuzzleRating(puzzle), themeRating)
      );
    }

    if (activePuzzle.isReview) {
      scaleRatingDelta(oldRating, themeRating);
    }

    await UserThemeColl.updateOne(
      { username: user.username, theme: theme },
      {
        $set: {
          rating: themeRating.rating,
          ratingDeviation: themeRating.ratingDeviation,
          volatility: themeRating.volatility,
          numberOfResults: themeRating.numberOfResults,
        },
      },
      { upsert: true } // Insert if not found.
    );

    const moves = puzzle.Moves.split(' ').length / 2;
    console.log(`\t\tTime per move : ${t / moves}`);

    if (success) {
      await TimeThemeColl.updateOne(
        { username: user.username, theme: theme },
        {
          $set: { time: t / moves },
        },
        { upsert: true }
      );
    }

    await RatingHistory.create({
      username: user.username,
      theme: theme,
      rating: themeRating.rating,
    });
  });

  return new Response(JSON.stringify(userRating), { status: 200 });
}
