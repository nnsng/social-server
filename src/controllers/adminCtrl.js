import Post from '../models/Post.js';
import User from '../models/User.js';
import { errorMessages } from '../utils/constants.js';
import postData from '../__mocks__/postData.js';

async function setRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: errorMessages['userNotFound'],
      });
    }

    await User.updateOne({ _id: userId }, { $set: { role } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function updateDb(req, res) {
  try {
    await generatePosts(postData);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function generatePosts(postList) {
  for (const post of postList) {
    const newPost = new Post(post);
    await newPost.save();
  }
}

async function deletePosts(filter) {
  await Post.deleteMany(filter);
}

const adminCtrl = {
  setRole,
  updateDb,
};

export default adminCtrl;
