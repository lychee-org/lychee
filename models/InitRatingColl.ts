import mongoose, { Schema } from 'mongoose';

const initRatingSchema = new Schema({
  username: { type: String, required: true },
  rating: Number,
});

// Index on username for fast lookups.
initRatingSchema.index({ username: 1 }, { unique: true });

export const InitRatingColl =
  mongoose.models.InitRating || mongoose.model('InitRating', initRatingSchema);
