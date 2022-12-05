import { io } from '../index.js';
import { User } from '../models/index.js';

async function chat(req, res) {
  try {
    const { userId, text } = req.body;
    const currentUser = req.user;

    const otherUser = await User.findById(userId).lean();
    if (!otherUser) {
      return res.status(404).json({ error: 'user.notFound' });
    }

    const group = [currentUser._id, otherUser._id];

    for (const userId of group) {
      const user = currentUser._id.equals(userId) ? otherUser : currentUser;
      const response = generateResponseMessage(text, user, currentUser._id);
      io.to(`${userId}`).emit('chat', response);
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

function generateResponseMessage(text, user, sentId) {
  const { _id, name, avatar, username } = user;
  return {
    user: { _id, name, avatar, username },
    message: {
      sentId,
      text,
      createdAt: Date.now(),
    },
  };
}

const chatCtrl = {
  chat,
};

export default chatCtrl;
