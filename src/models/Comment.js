import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      avatar: String,
      username: String,
      bio: String,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Comment', commentSchema);
