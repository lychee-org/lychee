import mongoose, { Schema } from 'mongoose';

const activePuzzleSchema = new Schema({
  username: String,
  puzzle: String,
  isReview: Boolean,
});

// Index on username for fast lookups.
activePuzzleSchema.index({ username: 1 }, { unique: true });

export const ActivePuzzleColl =
  mongoose.models.ActivePuzzle ||
  mongoose.model('ActivePuzzle', activePuzzleSchema);
