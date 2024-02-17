import { RatingColl } from '@/models/RatingColl';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import Rating from './GlickoV2Rating';

const DEFAULT_VOLATILITY: number = 0.09;

export const fetchUserRating = async (
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

export const getPuzzleRating = (puzzle: Puzzle): Rating =>
  new Rating(
    puzzle.Rating,
    puzzle.RatingDeviation,
    DEFAULT_VOLATILITY,
    puzzle.NbPlays
  );
