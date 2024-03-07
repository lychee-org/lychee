import mongoose, { Schema } from 'mongoose';

const recentGroupSchema = new Schema(
  {
    username: String,
    groupId: String,
    lastUsed: Date,
  },
  {
    timestamps: true,
  }
);

recentGroupSchema.index({ username: 1, groupId: 1, lastUsed: 1 });

export const RecentGroup =
  mongoose.models.RecentGroup ||
  mongoose.model('RecentGroup', recentGroupSchema);
