import mongoose, { Schema } from 'mongoose';

const roundSchema = new Schema({
  roundId: String, // The round ID is a concatenation of the user ID and the puzzle ID.
});

// Index on roundId for fast lookups.
roundSchema.index({ roundId: 1 }, { unique: true });

export const RoundColl =
  mongoose.models.Round || mongoose.model('Round', roundSchema);
