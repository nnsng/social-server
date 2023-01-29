import { Post, User } from '../models/index.js';
import { generateRegexFilter } from '../utils/common.js';

async function search(req, res) {
  try {
    const { search, q } = req.query;

    if (search === 'post') {
      const filter = generateRegexFilter('slug', q);
      const postList = await Post.find(filter).sort({ createdAt: -1 }).lean();
      return res.send(postList);
    }

    if (search === 'user') {
      const filter = generateRegexFilter('username', q);
      const userList = await User.find(filter).select('name username avatar').lean();
      return res.send(userList);
    }

    return res.status(400).json({ message: 'search must be `post` or `user`' });
  } catch (error) {
    res.status(500).json(error);
  }
}

const commonCtrl = {
  search,
};

export default commonCtrl;
