import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      max: 255,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 255,
    },
    avatar: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      required: true,
      min: 6,
      max: 20,
    },
    bio: {
      type: String,
      default: '',
    },
    saved: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      default: 'user',
    },
    type: {
      type: String,
      default: 'local',
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
