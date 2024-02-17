import mongoose, { Schema } from 'mongoose';

const ratingSchema = new Schema({
  username: { type: String, required: true },
  rating: Number,
  ratingDeviation: Number,
  volatility: Number,
  numberOfResults: Number,
});

// Index on username for fast lookups.
ratingSchema.index({ username: 1 }, { unique: true });

export const RatingColl =
  mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
