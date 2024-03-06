import { Puzzle } from "@/types/lichess-api";
import mongoose, { Schema } from "mongoose";

const leitnerSchema = new Schema({
  username: { type: String, required: true },
  boxA: Array<Puzzle>,
  boxB: Array<Puzzle>,
});

// Index on username for fast lookups.
leitnerSchema.index({ username: 1 }, { unique: true });

export const LeitnerColl =
  mongoose.models.Leitner || mongoose.model('Leitner', leitnerSchema);
