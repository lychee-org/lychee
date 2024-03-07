import mongoose, { Schema } from 'mongoose';

const timeThemeSchema = new Schema({
  username: String,
  theme: String,
  time: Number
});

// Index on username and theme for fast lookups.
timeThemeSchema.index({ username: 1, theme: 1 }, { unique: true });

export const TimeThemeColl =
  mongoose.models.TimeTheme ||
  mongoose.model('TimeTheme', timeThemeSchema);
