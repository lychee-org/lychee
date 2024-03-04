import { getThemeRatings } from '@/src/rating/getRating';
import { User } from 'lucia';
import { RatingHistory } from '@/models/RatingHistory';

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

export const getThemes = async (user: User) => {
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
      data.push({
        theme: k,
        ratings: ratingHistories[k],
        rating: v.rating,
        delta: calculateStreak(ratingHistories[k]),
        nb: v.numberOfResults,
      });
    }
  }

  return data;
};

const calculateStreak = (ratings: RatingHistory[]) => {
  // calculate delta from rating histories by adding up the longest running streak going from last to first
  // if (ratings.length === 1) {
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
