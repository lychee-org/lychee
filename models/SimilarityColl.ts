import { Puzzle } from '@/types/lichess-api';
import mongoose, { Schema } from 'mongoose';

const similaritySchema = new Schema({
    puzzleId: String, 
    similarity: Array<String>,
});
  
similaritySchema.index({ puzzleId: 1 }, { unique: true }); 

export const SimilarityColl =
  mongoose.models.SimilarityColl ||
  mongoose.model('Similarity', similaritySchema);