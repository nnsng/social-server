import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      require: true,
    },
    actionUser: {
      type: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        username: String,
      },
      require: true,
    },
    moreInfo: {
      type: {
        post: {
          _id: mongoose.Schema.Types.ObjectId,
          slug: String,
        },
      },
      require: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
