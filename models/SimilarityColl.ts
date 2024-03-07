import { Puzzle } from '@/types/lichess-api';
import mongoose, { Schema } from 'mongoose';

const similaritySchema = new Schema({
  puzzleId: String,
  cache: Array<String>,
});

similaritySchema.index({ puzzleId: 1 }, { unique: true });

export const SimilarityColl =
  mongoose.models.Similarity || mongoose.model('Similarity', similaritySchema);
