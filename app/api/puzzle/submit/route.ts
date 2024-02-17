import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import GameResult from '@/rating/GameResult';
import Rating from '@/rating/GlickoV2Rating';
import RatingCalculator from '@/rating/RatingCalculator';
import { Puzzle } from '@/types/lichess-api';
import { NextRequest } from 'next/server';
import { RatingColl } from '../../../../models/RatingColl';
import { RoundColl } from '@/models/RoundColl';
import { fetchUserRating, getPuzzleRating } from '@/rating/getRating';

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
          userRating: new Rating( // TODO: this is actually important to do!
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

  const puzzleRating: Rating = getPuzzleRating(puzzle);

  if (success) {
    new RatingCalculator().updateRatings(
      new GameResult(userRating, puzzleRating)
    );
  } else {
    new RatingCalculator().updateRatings(
      new GameResult(puzzleRating, userRating)
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

  // Insert this round into the round DB.
  // TODO: do we need await here?
  RoundColl.create({
    roundId: `${user.username}+${puzzle.PuzzleId}`,
  });

  return new Response(JSON.stringify(userRating), { status: 200 });
}
