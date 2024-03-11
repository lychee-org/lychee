import mongoose, { Schema } from 'mongoose';

const countPuzzleSchema = new Schema({
  username: String,
  count: Number,
});

// Index on username for fast lookups.
countPuzzleSchema.index({ username: 1 }, { unique: true });

export const CountColl =
  mongoose.models.Count ||
  mongoose.model('Count', countPuzzleSchema);
