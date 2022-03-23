import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    author: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      avatar: String,
      username: String,
    },
    keywords: {
      type: [{ name: String, value: String }],
      default: [],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      slug: 'title',
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postSchema);
