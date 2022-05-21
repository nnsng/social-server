import { io } from '../index.js';
import User from '../models/User.js';

async function chat(req, res) {
  try {
    const { group, text } = req.body;
    const currentUser = req.user;

    const otherUserId = group.find((id) => !currentUser._id.equals(id));
    const otherUser = await User.findById(otherUserId).lean();
    if (!otherUser) {
      return res.status(403).send(generateErrorObject('userNotFound'));
    }

    const message = {
      group: [
        {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          username: currentUser.username,
        },
        {
          _id: otherUser._id,
          name: otherUser.name,
          avatar: otherUser.avatar,
          username: otherUser.username,
        },
      ],
      sentUserId: currentUser._id,
      text,
    };

    for (const userId of group) {
      io.to(`${userId}`).emit('chat', { message });
    }

    res.sendStatus(200);
  } catch (error) {
    console.log('~ error', error);
    res.status(500).send(error);
  }
}

const chatCtrl = {
  chat,
};

export default chatCtrl;
