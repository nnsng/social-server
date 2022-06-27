import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import data from '../__mocks__/data.js';
import { generateErrorObject } from '../utils/error.js';
import { ROLE } from '../utils/constants.js';

async function setRole(req, res) {
  try {
    const { username, role } = req.body;

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).send(generateErrorObject('userNotFound'));
    }

    await User.updateOne({ username }, { $set: { role } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function updateDb(req, res) {
  try {
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function createMockData(req, res) {
  try {
    for (const { post, user } of data) {
      const newUser = new User({ ...user, role: ROLE.TEST });
      await newUser.save();

      const newPost = new Post({ ...post, authorId: newUser._id, author: user });
      await newPost.save();
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function deleteMockData(req, res) {
  try {
    const users = await User.find({ role: ROLE.TEST }).lean();
    for (const { _id } of users) {
      await Post.deleteMany({ authorId: _id });
      await User.deleteOne({ _id });
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

const adminCtrl = {
  setRole,
  updateDb,
  createMockData,
  deleteMockData,
};

export default adminCtrl;
