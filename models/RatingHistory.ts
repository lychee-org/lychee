import mongoose, { Schema } from 'mongoose';

const ratingHistorySchema = new Schema({
  username: String,
  theme: String,
  rating: Number,
}, {
    timestamps: true,
});

// Index on username and theme for fast lookups.
ratingHistorySchema.index({ username: 1, theme: 1 });

export const RatingHistory =
  mongoose.models.RatingHistory ||
  mongoose.model('RatingHistory', ratingHistorySchema);
