import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import GameResult from '@/rating/GameResult';
import Rating from '@/rating/GlickoV2Rating';
import RatingCalculator from '@/rating/RatingCalculator';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import { NextRequest } from 'next/server';
import { RatingColl } from '../../../../models/RatingColl';

const DEFAULT_VOLATILITY: number = 0.09;

const fetchUserRating = async (
  user: User
): Promise<{ userRating: Rating; present: boolean }> => {
  return RatingColl.findOne({ username: user.username }).then(
    async (result) => {
      // If it's in the rating DB, return it:
      if (result) {
        return {
          userRating: new Rating(
            result.rating,
            result.ratingDeviation,
            result.volatility,
            result.numberOfResults
          ),
          present: true,
        };
      }
      // Otherwise, retrieve all data (execept volatility which isn't public) from Lichess API:
      const { perfs } = await fetch(
        `https://lichess.org/api/user/${user?.username}`
      ).then((res) => res.json());
      const rating = perfs['puzzle']['rating'];
      const rd = perfs['puzzle']['rd'];
      const nb = perfs['puzzle']['games'];
      return {
        userRating: new Rating(rating, rd, DEFAULT_VOLATILITY, nb),
        present: false,
      };
    }
  );
};

const getPuzzleRating = (puzzle: Puzzle): Rating =>
  new Rating(
    puzzle.Rating,
    puzzle.RatingDeviation,
    DEFAULT_VOLATILITY,
    puzzle.NbPlays
  );

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

  // Delete previous entry if present.
  // TODO: this all will be refactored in later PR.
  if (present) {
    await RatingColl.deleteOne({ username: user.username });
  }

  await RatingColl.create({
    username: user.username,
    rating: userRating.rating,
    ratingDeviation: userRating.ratingDeviation,
    volatility: userRating.volatility,
    numberOfResults: userRating.numberOfResults,
  });

  return new Response(JSON.stringify(userRating), { status: 200 });
}
