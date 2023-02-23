import { Role } from '../constants/index.js';
import { io } from '../index.js';
import { Comment, Post, User } from '../models/index.js';
import { generateRegexFilter } from '../utils/common.js';
import { getPostResponse } from '../utils/mongoose.js';
import { generateErrorResponse } from '../utils/response.js';

async function getAll(req, res) {
  try {
    const user = req.user;
    const { username, ...params } = req.query;

    let filter = {};
    if (username) {
      filter = generateRegexFilter('author.username', username);
    }

    const postResponse = await getPostResponse(filter, params, user);

    res.send(postResponse);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getBySlug(req, res) {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
    }

    const commentCount = await Comment.countDocuments({ postId: post._id });
    const postResponse = {
      ...post,
      commentCount,
    };

    res.send(postResponse);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getForEdit(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
    }

    if (user.role !== Role.ADMIN && !post.authorId.equals(user._id)) {
      return res.status(403).json(generateErrorResponse('post.notAllowedToEdit'));
    }

    res.send(post);
  } catch (error) {
    res.status(500).json(error);
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
    res.status(500).json(error);
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
    res.status(500).json(error);
  }
}

async function update(req, res) {
  try {
    const { postId } = req.params;
    const formData = req.body;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
    }

    if (!post.authorId.equals(user._id)) {
      return res.status(403).json(generateErrorResponse('post.notAllowedToEdit'));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: formData },
      { new: true }
    ).lean();

    res.send(updatedPost);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function remove(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
    }

    if (user.role !== Role.ADMIN && !post.authorId.equals(user._id)) {
      return res.status(403).json(generateErrorResponse('post.notAllowedToDelete'));
    }

    await Post.deleteOne({ _id: postId });
    await Comment.deleteMany({ postId });
    await User.updateMany({ saved: { $in: [postId] } }, { $pull: { saved: postId } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function like(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;
    const { _id: userId } = user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
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

    const { likes, likeCount } = updatedPost;
    res.send({ likes, likeCount });
  } catch (error) {
    res.status(500).json(error);
  }
}

async function save(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
    }

    if (user.saved.includes(postId)) {
      return res.status(400).json(generateErrorResponse('post.saved'));
    }

    await User.updateOne({ _id: user._id }, { $push: { saved: postId } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function unsave(req, res) {
  try {
    const { postId } = req.params;
    const user = req.user;

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json(generateErrorResponse('post.notFound'));
    }

    if (!user.saved.includes(postId)) {
      return res.status(400).json(generateErrorResponse('post.notSaved'));
    }

    await User.updateOne({ _id: user._id }, { $pull: { saved: postId } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function search(req, res) {
  try {
    const { q } = req.query;

    const filter = generateRegexFilter('slug', q);
    const postList = await Post.find(filter).sort({ createdAt: -1 }).lean();
    return res.send(postList);
  } catch (error) {
    res.status(500).json(error);
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
};

export default postCtrl;
