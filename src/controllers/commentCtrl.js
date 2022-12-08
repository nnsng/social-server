import { Role } from '../constants/index.js';
import { io } from '../index.js';
import { Comment, Post } from '../models/index.js';

async function getByPostId(req, res) {
  try {
    const { postId } = req.query;

    const commentList = await Comment.find({ postId }).sort({ createdAt: 'desc' }).lean();

    res.send(commentList);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function create(req, res) {
  try {
    const formData = req.body;
    const { postId } = formData;
    const { _id, name, username, avatar, bio } = req.user;
    const user = { _id, name, username, avatar, bio };

    const post = await Post.findById(postId).lean();
    if (!post) {
      return res.status(404).json({ error: 'post.notFound' });
    }

    const newComment = new Comment({
      ...formData,
      user,
    });
    await newComment.save();

    const commentCount = await Comment.countDocuments({ postId });
    await Post.findByIdAndUpdate(postId, { $set: { commentCount } });

    io.to(`${postId}`).emit('createComment', {
      comment: newComment._doc,
    });

    if (!user._id.equals(post.authorId)) {
      io.to(`${post.authorId}`).emit('notify', {
        type: 'comment',
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

    res.send(newComment._doc);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function edit(req, res) {
  try {
    const { commentId } = req.params;
    const formData = req.body;
    const user = req.user;

    const comment = await Comment.findById(commentId).lean();
    if (!comment) {
      return res.status(404).json({ error: 'comment.notFound' });
    }

    if (!comment.userId.equals(user._id)) {
      return res.status(403).json({ error: 'comment.notAllowedToEdit' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { ...formData, edited: true } },
      { new: true }
    ).lean();

    io.to(`${comment.postId}`).emit('editComment', { comment: updatedComment });

    res.send(updatedComment);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function remove(req, res) {
  try {
    const { commentId } = req.params;
    const user = req.user;

    const comment = await Comment.findById(commentId).lean();
    if (!comment) {
      return res.status(404).json({ error: 'comment.notFound' });
    }

    if (user.role !== Role.ADMIN && !comment.userId.equals(user._id)) {
      return res.status(403).json({ error: 'comment.notAllowedToDelete' });
    }

    await Comment.deleteOne({ _id: commentId });

    const commentCount = await Comment.countDocuments({ postId: comment.postId });
    await Post.findByIdAndUpdate(comment.postId, { $set: { commentCount } });

    io.to(`${comment.postId}`).emit('removeComment', { id: comment._id });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function like(req, res) {
  try {
    const { commentId } = req.params;
    const { _id: userId } = req.user;

    const comment = await Comment.findById(commentId).lean();
    if (!comment) {
      return res.status(404).json({ error: 'comment.notFound' });
    }

    const isLiked = comment.likes.some((id) => id.equals(userId));
    const update = isLiked ? { $pull: { likes: userId } } : { $push: { likes: userId } };

    const updatedComment = await Comment.findByIdAndUpdate(commentId, update, {
      new: true,
    }).lean();

    res.send(updatedComment);
  } catch (error) {
    res.status(500).json(error);
  }
}

const commentCtrl = {
  getByPostId,
  create,
  edit,
  remove,
  like,
};

export default commentCtrl;
