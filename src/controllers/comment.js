import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

export const getPostComment = async (req, res) => {
	const { postId } = req.params;

	try {
		const commentList = await Comment.find({ postId }).sort({
			createdAt: 'desc',
		});

		res.status(200).send(commentList);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const createComment = async (req, res) => {
	const formData = req.body;
	const { userId, postId } = formData;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).send({ error: 'User not found' });

		const newComment = new Comment({
			...formData,
			user: {
				_id: user._id,
				name: user.name,
				avatar: user.avatar,
			},
		});
		await newComment.save();

		const postComments = await Comment.find({ postId }).lean();
		await Post.findByIdAndUpdate(postId, {
			$set: { commentCount: postComments.length },
		});

		res.status(200).send(newComment);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const removeComment = async (req, res) => {
	const { commentId } = req.params;

	try {
		const comment = await Comment.findByIdAndDelete(commentId);

		const postComments = await Comment.find({ postId: comment.postId }).lean();
		await Post.findByIdAndUpdate(comment.postId, {
			$set: { commentCount: postComments.length },
		});

		res.status(200).send({ message: 'Comment deleted' });
	} catch (error) {
		res.status(400).send(error);
	}
};

export const likeComment = async (req, res) => {
	const { commentId } = req.params;
	const { _id: userId } = req.user;

	try {
		const comment = await Comment.findById(commentId);
		const likeArray = comment.likes;

		if (!likeArray.includes(userId)) {
			likeArray.push(userId);
		} else {
			likeArray.splice(likeArray.indexOf(userId), 1);
		}

		const updatedComment = await Comment.findByIdAndUpdate(
			commentId,
			{ $set: { likes: likeArray } },
			{ new: true }
		);

		res.status(200).send(updatedComment);
	} catch (error) {
		res.status(400).send(error);
	}
};
