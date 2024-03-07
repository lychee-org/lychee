import { Puzzle } from '@/types/lichess-api';
import mongoose, { Schema } from 'mongoose';

const themedLeitnerSchema = new Schema({
  username: { type: String, required: true },
  boxA: Array<Puzzle>,
  boxB: Array<Puzzle>,
  groupID: String,
});

// Index on username for fast lookups.
themedLeitnerSchema.index({ username: 1 }, { unique: true });

export const ThemedLeitnerColl =
  mongoose.models.ThemedLeitner ||
  mongoose.model('ThemedLeitner', themedLeitnerSchema);
