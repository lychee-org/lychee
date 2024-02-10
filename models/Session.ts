import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  } as const,
  { _id: false }
);

export default mongoose.models.Session || mongoose.model('Pet', SessionSchema);
