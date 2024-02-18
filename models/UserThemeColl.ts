import mongoose, { Schema } from 'mongoose';

const userThemeSchema = new Schema({
  username: String,
  theme: String,
  rating: Number,
  ratingDeviation: Number,
  volatility: Number,
  numberOfResults: Number,
});

// Index on username and theme for fast lookups.
userThemeSchema.index({ username: 1, theme: 1 }, { unique: true });

export const UserThemeColl =
  mongoose.models.UserThemeRating ||
  mongoose.model('UserThemeRating', userThemeSchema);
