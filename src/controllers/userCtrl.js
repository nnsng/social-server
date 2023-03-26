import { io } from '../index.js';
import { Comment, Notification, Post, User } from '../models/index.js';
import { mapFollowUserId } from '../utils/mongoose.js';
import { generateErrorResponse } from '../utils/response.js';

async function getCurrentUser(req, res) {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id).select('-password -saved').lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    await mapFollowUserId(user);

    res.send(user);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getUserInfo(req, res) {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .select('name avatar username bio following followers')
      .lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    await mapFollowUserId(user);

    res.send(user);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function updateCurrentUser(req, res) {
  try {
    const user = req.user;
    const { name, email, username, avatar, bio } = req.body;

    const data = {
      name: name.trim(),
      email,
      username: username.toLowerCase(),
      avatar,
      bio,
    };

    if (data.email !== user.email) {
      return res.status(400).json(generateErrorResponse('user.cannotChangeEmail'));
    }

    const existedUser = await User.findOne({ username: data.username }).lean();
    if (existedUser && !existedUser._id.equals(user._id)) {
      return res.status(400).json(generateErrorResponse('auth.usernameExist'));
    }

    await User.updateOne({ _id: user._id }, { $set: data });

    const updatedUser = await User.findById(user._id).select('-password -saved').lean();

    await Post.updateMany({ authorId: user._id }, { $set: { author: updatedUser } });
    await Comment.updateMany({ userId: user._id }, { $set: { user: updatedUser } });

    res.send(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function follow(req, res) {
  try {
    const currentUser = req.user;
    const { userId } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    if (currentUser.following.includes(userId)) {
      return res.status(400).json(generateErrorResponse('user.alreadyFollow'));
    }

    await User.updateOne({ _id: currentUser._id }, { $push: { following: userId } });
    const updatedCurrentUser = await User.findById(currentUser._id).select('following').lean();

    await User.updateOne({ _id: userId }, { $push: { followers: currentUser._id } });
    const updatedUser = await User.findById(userId).select('followers').lean();

    const newNotification = new Notification({
      userId: userId,
      type: 'follow',
      actionedUser: {
        _id: currentUser._id,
        name: currentUser.name,
        username: currentUser.username,
      },
    });
    await newNotification.save();

    io.to(`${userId}`).emit('notify', {
      type: 'follow',
      user: currentUser.name,
      url: `/profile/${currentUser.username}`,
    });

    await mapFollowUserId(updatedCurrentUser, updatedUser);

    res.send({ currentUser: updatedCurrentUser, selectedUser: updatedUser });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function unfollow(req, res) {
  try {
    const currentUser = req.user;
    const { userId } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    if (!currentUser.following.includes(userId)) {
      return res.status(400).json(generateErrorResponse('user.notFollow'));
    }

    await User.updateOne({ _id: currentUser._id }, { $pull: { following: userId } });
    const updatedCurrentUser = await User.findById(currentUser._id).select('following').lean();

    await User.updateOne({ _id: userId }, { $pull: { followers: currentUser._id } });
    const updatedUser = await User.findById(userId).select('followers').lean();

    await mapFollowUserId(updatedCurrentUser, updatedUser);

    await Notification.deleteOne({
      userId: userId,
      type: 'follow',
      'actionedUser._id': currentUser._id,
    });

    res.send({ currentUser: updatedCurrentUser, selectedUser: updatedUser });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function search(req, res) {
  try {
    const user = req.user;
    const { q, followed } = req.query;

    let idFilter;

    if (followed === 'true') {
      idFilter = { $in: user.following };
    }

    if (followed === 'false') {
      idFilter = { $nin: user.following, $ne: user._id };
    }

    const filter = {
      username: { $regex: new RegExp(q), $options: 'i' },
      ...(idFilter ? { _id: idFilter } : {}),
    };
    const userList = await User.find(filter).select('name username avatar bio').lean();
    return res.send(userList);
  } catch (error) {
    res.status(500).json(error);
  }
}

const userCtrl = {
  getCurrentUser,
  getUserInfo,
  updateCurrentUser,
  follow,
  unfollow,
  search,
};

export default userCtrl;
