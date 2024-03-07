import { getExistingUserRating, getThemeRatings } from '@/src/rating/getRating';
import { User } from 'lucia';
import { RatingHistory } from '@/models/RatingHistory';
import * as d3 from 'd3';
import { isIrrelevant } from '../puzzle/nextPuzzle/themeGenerator';
import { allThemes } from '@/lib/utils';

type RatingHistory = {
  rating: number;
  createdAt: Date;
};

export type ThemeData = {
  theme: string;
  ratings: RatingHistory[];
  rating: number;
  delta: number;
  nb: number;
};

export const getThemes = async (
  user: User
): Promise<[ThemeData[], string[]]> => {
  const themeRatings = await getThemeRatings(user, true);
  const ratings = await RatingHistory.find({ username: user.username });

  // group ratings by theme
  const ratingHistories: Record<string, RatingHistory[]> = {};
  for (const rating of ratings) {
    if (!(rating.theme in ratingHistories)) {
      ratingHistories[rating.theme] = [];
    }
    ratingHistories[rating.theme].push({
      rating: rating.rating,
      createdAt: rating.createdAt,
    });
  }

  const data: ThemeData[] = [];
  for (let [k, v] of themeRatings) {
    if (k in ratingHistories) {
      ratingHistories[k].unshift({
        rating: 1500,
        createdAt: d3.timeMinute.offset(ratingHistories[k][0].createdAt, -10),
      });
      data.push({
        theme: k,
        ratings: ratingHistories[k],
        rating: v.rating,
        delta: streak,
      const streak = calculateStreak(ratingHistories[k]);
        nb: v.numberOfResults,
      });
    }
  }

  // add themes that have no ratings after filtering fromm irrelevant themes
  const missed = allThemes
    .filter(isIrrelevant)
    .filter((theme) => !(theme in themeRatings) || !(theme in ratingHistories));

  return [data, missed];
};

export const ratingHistory = async (user: User) => {
  const ratings = await RatingHistory.find({
    username: user.username,
    theme: 'overall',
  });
  return {
    ratings: ratings,
    rating: userRating.rating,
    delta: calculateStreak(ratings),
  };
};
  const userRating = await getExistingUserRating(user);
  const initRating =
    (await InitRatingColl.findOne({ username: user.username })) || 1500;

const calculateStreak = (ratings: RatingHistory[]) => {
  // calculate delta from rating histories by adding up the longest running streak going from last to first
  // if (ratings.length === 1) {
  const firstRating = initRating.rating || ratings[0]?.rating || userRating.rating;
  ratings.unshift({
    rating: firstRating,
    createdAt: d3.timeMinute.offset(ratings[0]?.rating || new Date(Date.now()), -10),
  });
  //   return ratings[0].rating - 1500;
  // }
  let streak = 0;

  for (let i = ratings.length - 2; i >= -1; i--) {
    if (i === -1) {
      streak += ratings[0].rating - 1500;
      break;
    } else if (
      streak == 0 ||
      ratings[i + 1].rating - ratings[i].rating > 0 === streak > 0
    ) {
      streak += ratings[i + 1].rating - ratings[i].rating;
    } else {
      break;
    }
  }
  return streak;
};
