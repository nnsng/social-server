import { Notification, User } from '../models/index.js';
import { generateErrorResponse } from '../utils/response.js';

async function setRole(req, res) {
  try {
    const { username, role } = req.body;

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json(generateErrorResponse('user.notFound'));
    }

    await User.updateOne({ username }, { $set: { role } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function updateDb(req, res) {
  try {
    await Notification.deleteMany({});
    await User.updateMany({}, { $set: { following: [], followers: [] } });
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

const adminCtrl = {
  setRole,
  updateDb,
};

export default adminCtrl;
