import { io } from '../index.js';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { generateRegexFilter } from '../utils/common.js';
import { ROLE } from '../utils/constants.js';
import { generateErrorObject } from '../utils/error.js';
import { getPostResponse } from '../utils/mongoose.js';

const generateFilter = ({ search, hashtag, username }) => {
  if (search) return generateRegexFilter('slug', search);
  if (hashtag) return { hashtags: hashtag };
  if (username) return generateRegexFilter('author.username', username);
  return {};
};

async function getAll(req, res) {
  try {
    const user = req.user;
    const { search, hashtag, username, ...params } = req.query;

    const filter = generateFilter({ search, hashtag, username });
    const postResponse = await getPostResponse(filter, params, user);

    res.send(postResponse);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getBySlug(req, res) {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    const commentCount = await Comment.countDocuments({ postId: post._id });
    const postResponse = {
      ...post,
      commentCount,
    };

    res.send(postResponse);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getForEdit(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    if (user.role !== ROLE.ADMIN && !post.authorId.equals(user._id)) {
      return res.status(403).send(generateErrorObject('notAllowedEditPost'));
    }

    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getSaved(req, res) {
  try {
    const params = req.query;
    const { saved } = req.user;

    const filter = { _id: { $in: saved } };
    const postResponse = await getPostResponse(filter, params);

    const postList = [...postResponse.data];
    saved.reverse().forEach((postId, idx) => {
      const post = postList.find((p) => p._id.equals(postId));
      postResponse.data[idx] = post;
    });

    res.send(postResponse);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function create(req, res) {
  try {
    const formData = req.body;
    const { _id, name, username, avatar, bio } = req.user;
    const author = { _id, name, username, avatar, bio };

    const newPost = new Post({
      ...formData,
      author,
    });
    const savedPost = await newPost.save();

    res.send(savedPost?._doc);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function update(req, res) {
  try {
    const { postId } = req.params;
    const formData = req.body;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    if (!post.authorId.equals(user._id)) {
      return res.status(403).send(generateErrorObject('notAllowedEditPost'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: formData },
      { new: true }
    ).lean();

    res.send(updatedPost);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function remove(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    if (user.role !== ROLE.ADMIN && !post.authorId.equals(user._id)) {
      return res.status(403).send(generateErrorObject('notAllowedDeletePost'));
    }

    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ postId });
    await User.updateMany({ saved: { $in: [postId] } }, { $pull: { saved: postId } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function like(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;
    const { _id: userId } = user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    const isLiked = post.likes.some((id) => id.equals(userId));
    const update = isLiked
      ? { $pull: { likes: userId }, $inc: { likeCount: -1 } }
      : { $push: { likes: userId }, $inc: { likeCount: 1 } };

    const updatedPost = await Post.findByIdAndUpdate(postId, update, {
      new: true,
    }).lean();

    if (!isLiked && !userId.equals(post.authorId)) {
      io.to(`${post.authorId}`).emit('notify', {
        type: 'like',
        post: {
          _id: post._id,
          slug: post.slug,
        },
        user: {
          name: user.name,
          username: user.username,
          avatar: user.avatar,
        },
        read: false,
        createdAt: Date.now(),
      });
    }

    res.send(updatedPost);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function save(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    if (user.saved.includes(postId)) {
      return res.status(400).send(generateErrorObject('postSaved'));
    }

    await User.updateOne({ _id: user._id }, { $push: { saved: postId } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function unsave(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).send(generateErrorObject('postNotFound'));
    }

    if (!user.saved.includes(postId)) {
      return res.status(400).send(generateErrorObject('postNotSaved'));
    }

    await User.updateOne({ _id: user._id }, { $pull: { saved: postId } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function search(req, res) {
  try {
    const { searchFor, searchTerm } = req.query;

    const filter = generateFilter({ [searchFor]: searchTerm });

    const postList = await Post.find(filter).sort({ createdAt: -1 }).lean();

    return res.send(postList);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getTopHashtags(req, res) {
  try {
    const postHashtags = await Post.find({}).select('hashtags').lean();
    const quantities = postHashtags
      .reduce((acc, cur) => [...acc, ...cur.hashtags], [])
      .reduce((acc, cur) => {
        acc[cur] = (acc[cur] || 0) + 1;
        return acc;
      }, {});

    const topHashtags = Object.entries(quantities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((x) => x[0]);

    res.send(topHashtags);
  } catch (error) {
    res.status(500).send(error);
  }
}

const postCtrl = {
  getAll,
  getBySlug,
  getForEdit,
  getSaved,
  create,
  update,
  remove,
  like,
  save,
  unsave,
  search,
  getTopHashtags,
};

export default postCtrl;
