import { validateRequest } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import GameResult from '@/rating/GameResult';
import Rating from '@/rating/GlickoV2Rating';
import RatingCalculator from '@/rating/RatingCalculator';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import { NextRequest } from 'next/server';

interface SubmitPuzzleBody {
  puzzleId: string;
  correct: boolean;
}

const DEFAULT_VOLATILITY: number = 0.09;

const fetchUserRating = async (user: User): Promise<Rating> => {
  const { perfs } = await fetch(
    `https://lichess.org/api/user/${user?.username}`
  ).then((res) => res.json());
  const rating = perfs['puzzle']['rating'];
  const rd = perfs['puzzle']['rd'];
  const nb = perfs['puzzle']['games'];
  return new Rating(rating, rd, DEFAULT_VOLATILITY, nb);
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
  if (!user) return new Response('Unauthorized', { status: 401 });
  const body = await req.json();

  const { puzzle_, success_, prv_ } = body;

  // TODO.
  const puzzle = puzzle_ as Puzzle;
  const success = success_ as boolean;
  const prv = prv_ as Rating;

  const userRating: Rating =
    prv.rating < 0
      ? await fetchUserRating(user)
      : new Rating( // TODO: this is actually important to do!
          prv.rating,
          prv.ratingDeviation,
          prv.volatility,
          prv.numberOfResults
        );

  const puzzleRating: Rating = getPuzzleRating(puzzle);

  console.log(userRating, puzzleRating);

  if (success) {
    new RatingCalculator().updateRatings(
      new GameResult(userRating, puzzleRating)
    );
  } else {
    new RatingCalculator().updateRatings(
      new GameResult(puzzleRating, userRating)
    );
  }

  return new Response(JSON.stringify(userRating), { status: 200 });
}
