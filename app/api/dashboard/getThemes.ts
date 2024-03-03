import { getThemeRatings } from '@/src/rating/getRating';
import { User } from 'lucia';
import { RatingHistory } from '@/models/RatingHistory';

type RatingHistory = {
  rating: number;
  createdAt: Date;
};

type ThemeData = {
  theme: string;
  ratings: RatingHistory[];
  rating: number;
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
        nb: v.numberOfResults,
      });
    }
  }

  return data;
};
