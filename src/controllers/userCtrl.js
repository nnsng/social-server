import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { generateErrorObject } from '../utils/error.js';

async function getCurrentUser(req, res) {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id).select('-password -saved').lean();
    if (!user) {
      return res.status(404).send(generateErrorObject('userNotFound'));
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getUserInfo(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('name avatar username bio following followers')
      .lean();
    if (!user) {
      return res.status(404).send(generateErrorObject('userNotFound'));
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
      return res.status(400).send(generateErrorObject('cannotChangeEmail'));
    }

    const existedUser = await User.findOne({ username: data.username }).lean();
    if (existedUser && !existedUser._id.equals(user._id)) {
      return res.status(400).send(generateErrorObject('usernameExist'));
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

async function follow(req, res) {
  try {
    const currentUser = req.user;
    const { userId } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).send(generateErrorObject('userNotFound'));
    }

    if (currentUser.following.includes(userId)) {
      return res.status(400).send(generateErrorObject('alreadyFollow'));
    }

    await User.updateOne({ _id: currentUser._id }, { $push: { following: userId } });
    const updatedCurrentUser = await User.findById(currentUser._id)
      .select('-password -saved')
      .lean();

    await User.updateOne({ _id: userId }, { $push: { followers: currentUser._id } });
    const updatedUser = await User.findById(userId)
      .select('name avatar username bio following followers')
      .lean();

    res.send({ currentUser: updatedCurrentUser, selectedUser: updatedUser });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function unfollow(req, res) {
  try {
    const currentUser = req.user;
    const { userId } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).send(generateErrorObject('userNotFound'));
    }

    if (!currentUser.following.includes(userId)) {
      return res.status(400).send(generateErrorObject('notFollow'));
    }

    await User.updateOne({ _id: currentUser._id }, { $pull: { following: userId } });
    const updatedCurrentUser = await User.findById(currentUser._id)
      .select('-password -saved')
      .lean();

    await User.updateOne({ _id: userId }, { $pull: { followers: currentUser._id } });
    const updatedUser = await User.findById(userId)
      .select('name avatar username bio following followers')
      .lean();

    res.send({ currentUser: updatedCurrentUser, selectedUser: updatedUser });
  } catch (error) {
    res.status(500).send(error);
  }
}

const userCtrl = {
  getCurrentUser,
  getUserInfo,
  updateProfile,
  follow,
  unfollow,
};

export default userCtrl;
