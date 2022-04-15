import Post from '../models/Post.js';
import User from '../models/User.js';

async function setRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).send({
        name: 'userNotFound',
        message: 'User not found.',
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
    // await User.updateMany({}, { $rename: { name: 'fullName' } });
    await User.deleteMany({ role: 'user' });

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
