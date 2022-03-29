import Post from '../models/Post.js';
import User from '../models/User.js';

async function setRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).send({ message: 'User not found' });

    await User.updateOne({ _id: userId }, { $set: { role } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function updateDb(req, res) {
  try {
    const postList = await Post.find({}).lean();

    postList.forEach(async (post) => {
      const user = await User.findById(post.authorId);

      await Post.updateOne(
        { _id: post._id },
        {
          author: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
            username: user.username,
          },
        }
      );
    });

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
