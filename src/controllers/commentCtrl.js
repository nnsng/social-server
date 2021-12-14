import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const getPostComment = async (req, res) => {
	try {
		const { postId } = req.query;

		const commentList = await Comment.find({ postId }).sort({
			createdAt: 'desc',
		});

		res.send(commentList);
	} catch (error) {
		res.status(400).send(error);
	}
};

const createComment = async (req, res) => {
	try {
		const formData = req.body;
		const { postId } = formData;

		if (!req.user)
			return res.status(400).send({ message: 'Invalid Authentication.' });

		const newComment = new Comment(formData);
		await newComment.save();

		const postComments = await Comment.find({ postId }).lean();
		console.log('~ postComments', postComments);
		await Post.findByIdAndUpdate(postId, {
			$set: { commentCount: postComments.length },
		});

		res.send(newComment);
	} catch (error) {
		console.log('~ error', error);
		res.status(400).send(error);
	}
};

const removeComment = async (req, res) => {
	try {
		const { commentId } = req.params;

		if (!req.user)
			return res.status(400).send({ message: 'Invalid Authentication.' });

		const user = req.user;

		const comment = await Comment.findById(commentId).lean();
		if (!comment)
			return res.status(400).send({ message: 'Comment not found.' });

		if (user.role !== 'admin' && comment.userId !== user._id)
			return res
				.status(400)
				.send('You are not authorized to delete this comment');

		await Comment.deleteOne({ _id: commentId });

		const postComments = await Comment.find({ postId: comment?.postId }).lean();
		await Post.updateOne(
			{ _id: comment?.postId },
			{
				$set: { commentCount: postComments.length },
			}
		);

		res.send({ message: 'Comment deleted' });
	} catch (error) {
		res.status(400).send(error);
	}
};

const likeComment = async (req, res) => {
	try {
		const { commentId } = req.params;

		if (!req.user)
			return res.status(400).send({ message: 'Invalid Authentication.' });

		const { _id: userId } = req.user;

		const comment = await Comment.findById(commentId);
		const likeArray = comment.likes;

		if (!likeArray.includes(userId)) {
			likeArray.push(userId);
		} else {
			const idx = likeArray.indexOf(userId);
			likeArray.splice(idx, 1);
		}

		const updatedComment = await Comment.findByIdAndUpdate(
			commentId,
			{ $set: { likes: likeArray } },
			{ new: true }
		);

		res.send(updatedComment);
	} catch (error) {
		res.status(400).send(error);
	}
};

const commentCtrl = {
	getPostComment,
	createComment,
	removeComment,
	likeComment,
};

export default commentCtrl;
