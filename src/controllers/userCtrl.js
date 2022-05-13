import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { errorMessages } from '../utils/constants.js';

async function getCurrentUser(req, res) {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id).select('-password -saved').lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: errorMessages['userNotFound'],
      });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getUserInfo(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('name avatar username bio').lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: errorMessages['userNotFound'],
      });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function updateProfile(req, res) {
  try {
    const { email, ...data } = req.body;
    const user = req.user;

    if (email !== user.email) {
      return res.status(400).send({
        name: 'cannotChangeEmail',
        message: errorMessages['cannotChangeEmail'],
      });
    }

    const existedUser = await User.findOne({ username: data.username }).lean();
    if (existedUser && !existedUser._id.equals(user._id)) {
      return res.status(400).send({
        name: 'usernameExist',
        message: errorMessages['usernameExist'],
      });
    }

    await User.updateOne({ _id: user._id }, { $set: data });

    const updatedUser = await User.findById(user._id).select('-password -saved').lean();

    await Post.updateMany({ authorId: user._id }, { $set: { author: updatedUser } });
    await Comment.updateMany({ userId: user._id }, { $set: { user: updatedUser } });

    res.send(updatedUser);
  } catch (error) {
    res.status(500).send(error);
  }
}

const userCtrl = {
  getCurrentUser,
  getUserInfo,
  updateProfile,
};

export default userCtrl;
