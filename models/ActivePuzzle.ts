import mongoose, { Schema } from 'mongoose';

const activePuzzleSchema = new Schema({
  username: String,
  puzzle: String,
  isReview: Boolean,
  reviewee: String, // Original puzzle, if it's a similar one. TODO: Redundancy with above.
  groupID: String,
});

// Index on username for fast lookups.
activePuzzleSchema.index({ username: 1 }, { unique: true });

export const ActivePuzzleColl =
  mongoose.models.ActivePuzzle ||
  mongoose.model('ActivePuzzle', activePuzzleSchema);
