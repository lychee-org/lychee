import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import GameResult from '@/rating/GameResult';
import Rating from '@/rating/GlickoV2Rating';
import RatingCalculator from '@/rating/RatingCalculator';
import { Puzzle } from '@/types/lichess-api';
import { NextRequest } from 'next/server';
import { RatingColl } from '../../../../models/RatingColl';
import { RoundColl } from '@/models/RoundColl';
import {
  fetchUserRating,
  getDefaultRating,
  getPuzzleRating,
  getThemeRatings,
} from '@/rating/getRating';
import { AllRoundColl } from '@/models/AllRoundColl';
import { UserThemeColl } from '@/models/UserThemeColl';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { user } = await validateRequest();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { puzzle_, success_, prv_ } = await req.json();

  // TODO.
  const puzzle = puzzle_ as Puzzle;
  const success = success_ as boolean;
  const prv = prv_ as Rating;

  const { userRating, present } =
    prv.rating < 0
      ? await fetchUserRating(user)
      : {
          userRating: new Rating( // MB: This is important!
            prv.rating,
            prv.ratingDeviation,
            prv.volatility,
            prv.numberOfResults
          ),
          present: true,
        };

  if (!present) {
    throw new Error("User's rating not found in DB");
  }

  if (success) {
    new RatingCalculator().updateRatings(
      new GameResult(userRating, getPuzzleRating(puzzle))
    );
  } else {
    new RatingCalculator().updateRatings(
      new GameResult(getPuzzleRating(puzzle), userRating)
    );
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

  // Insert this round into the round DB. Currently, this is unused.
  await RoundColl.create({
    roundId: `${user.username}+${puzzle.PuzzleId}`,
  });

  await AllRoundColl.updateOne(
    { username: user.username },
    {
      // Append puzzle ID to the array of solved IDs.
      $addToSet: { solved: puzzle.PuzzleId },
    }
  );

  // NB: We don't filter out irrelevant themes here. Even if theme is irrelevant, we compute ratings and 
  // persist in the DB, as this information is useful for dashboard analysitcs.
  const ratingMap = await getThemeRatings(user, false);
  console.log(ratingMap); // TODO(sm3421): Remove.

  // Update theme ratings.
  const themes = puzzle.Themes.split(' ');
  themes.forEach(async (theme) => {
    const themeRating: Rating = ratingMap.get(theme) || getDefaultRating();

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
  });

  return new Response(JSON.stringify(userRating), { status: 200 });
}
