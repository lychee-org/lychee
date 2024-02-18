import { RatingHolder } from '@/components/puzzle-ui/puzzle-mode';
import { AllRoundColl } from '@/models/AllRoundColl';
import { RatingColl } from '@/models/RatingColl';
import { fetchUserRating } from '@/rating/getRating';
import { Puzzle } from '@/types/lichess-api';
import { User } from 'lucia';
import mongoose from 'mongoose';

const RATING_RADIUS = 300;

export type PuzzleWithUserRating = {
  puzzle: Puzzle;
  rating: RatingHolder;
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
      AllRoundColl.create({
        username: user.username,
        solved: [],
      });
    }
    const exceptions = (await AllRoundColl.findOne({ username: user.username }))
      .solved;
    // Now get puzzle based on user rating that user hasn't seen yet.
    const p = await mongoose.connection.collection('testPuzzles').findOne({
      PuzzleId: { $nin: exceptions },
      Rating: {
        $gt: userRating.rating - RATING_RADIUS,
        $lt: userRating.rating + RATING_RADIUS,
      },
    });
    let { _id: _, ...rest } = p as any;
    console.log(rest['Moves']);
    return {
      puzzle: rest as any as Puzzle,
      rating: {
        rating: userRating.rating,
        ratingDeviation: userRating.ratingDeviation,
        volatility: userRating.volatility,
        numberOfResults: userRating.numberOfResults,
      },
    };
  });

export default nextPuzzleFor;
