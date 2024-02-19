import mongoose, { Schema } from 'mongoose';

const allRoundSchema = new Schema({
  username: String,
  solved: Array<String>,
});

// Index on username for fast lookups.
allRoundSchema.index({ username: 1 }, { unique: true });

export const AllRoundColl =
  mongoose.models.AllRound || mongoose.model('AllRound', allRoundSchema);
