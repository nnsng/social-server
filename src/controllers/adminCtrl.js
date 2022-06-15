import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { hashPassword, randomNumber } from '../utils/common.js';
import { generateErrorObject } from '../utils/error.js';
import mockData from '../__mocks__/output_data.js';

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
    // const posts = await Post.find({}).lean();
    // for (const post of posts) {
    //   const user = await User.findById(post.authorId).lean();
    //   if (user.role === 'test') {
    //     await Post.deleteOne({ _id: post._id });
    //     await User.deleteOne({ _id: user._id });
    //   }
    // }
    for (const data of mockData) {
      const { author, ...post } = data;

      const hashedPassword = await hashPassword(author.password);

      const newUser = new User({
        ...author,
        password: hashedPassword,
        role: 'test',
      });
      const savedUser = await newUser.save();

      const newPost = new Post({
        ...post,
        authorId: savedUser._id,
        author: {
          _id: savedUser._id,
          name: savedUser.name,
          username: savedUser.username,
          avatar: savedUser.avatar,
          bio: savedUser.bio,
        },
      });
      await newPost.save();
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
};

export default adminCtrl;
