import Post from '../models/Post.js';
import User from '../models/User.js';
import { hashPassword } from '../utils/common.js';

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
    const hashedPassword = await hashPassword('123456');
    await User.updateOne(
      { _id: '625ae349245dd092cf14c49b' },
      { $set: { password: hashedPassword } }
    );

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
