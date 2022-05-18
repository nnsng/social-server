import Post from '../models/Post.js';
import User from '../models/User.js';
import { generateErrorObject } from '../utils/error.js';

async function setRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).send(generateErrorObject('userNotFound'));
    }

    await User.updateOne({ _id: userId }, { $set: { role } });

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

async function testFunction(req, res) {
  try {
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

const adminCtrl = {
  setRole,
  updateDb,
  testFunction,
};

export default adminCtrl;
