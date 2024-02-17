import mongoose, { Schema } from 'mongoose';

const ratingSchema = new Schema({
  username: String,
  rating: Number,
  ratingDeviation: Number,
  volatility: Number,
  numberOfResults: Number,
});

export const RatingColl =
  mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
