import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  } as const,
  { _id: false }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
