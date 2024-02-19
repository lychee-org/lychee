import { Puzzle } from '@/types/lichess-api';
import mongoose, { Schema } from 'mongoose';

const lastBatchSchema = new Schema({
  username: String,
  batch: Array<Puzzle>,
});

// Index on username for fast lookups.
lastBatchSchema.index({ username: 1 }, { unique: true });

export const LastBatchColl =
  mongoose.models.LastBatch || mongoose.model('LastBatch', lastBatchSchema);
