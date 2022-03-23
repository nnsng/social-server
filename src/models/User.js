import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
      min: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
    phone: {
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('User', userSchema);
