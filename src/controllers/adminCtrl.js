import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { generateErrorObject } from '../utils/error.js';

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

const adminCtrl = {
  setRole,
  updateDb,
};

export default adminCtrl;
