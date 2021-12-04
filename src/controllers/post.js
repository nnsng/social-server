import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { createToken } from '../utils/common.js';
import { getPostResponse } from '../utils/mongoose.js';

export const getAll = async (req, res) => {
	const params = req.query;

	try {
		const findFilter = params.tag ? { 'tags.value': params.tag } : {};
		const postResponse = await getPostResponse(findFilter, params);

		res.status(200).send(postResponse);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const getMyPosts = async (req, res) => {
	const params = req.query;
	const user = req.user;

	try {
		const findFilter = { authorId: user._id };
		const postResponse = await getPostResponse(findFilter, params);

		res.status(200).send(postResponse);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const getSavedPostList = async (req, res) => {
	const params = req.query;
	const { _id } = req.user;

	try {
		const user = await User.findById(_id).lean();
		const findFilter = { _id: { $in: user.saved } };
		const postResponse = await getPostResponse(findFilter, params);

		res.status(200).send(postResponse);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const getBySlug = async (req, res) => {
	const { postSlug } = req.params;

	try {
		const post = await Post.findOne({ slug: postSlug }).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		const comments = await Comment.find({ postId: post._id }).lean();

		res.status(200).send({
			...post,
			comments,
		});
	} catch (error) {
		res.status(400).send(error);
	}
};

export const getPostForEdit = async (req, res) => {
	const { postId } = req.params;
	const user = req.user;

	try {
		const post = await Post.findById(postId).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		if (post.authorId !== user._id)
			return res
				.status(403)
				.send({ message: 'You are not authorized to edit this post' });

		res.status(200).send(post);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const createPost = async (req, res) => {
	const formData = req.body;
	const user = req.user;

	try {
		const newPost = new Post({
			...formData,
			author: {
				_id: user._id,
				name: user.name,
				avatar: user.avatar,
			},
		});

		const savedPost = await newPost.save();

		res.status(200).send(savedPost?._doc);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const updatePost = async (req, res) => {
	const { postId } = req.params;
	const formData = req.body;
	const user = req.user;

	if (formData.authorId !== user._id)
		return res.status(403).send({ message: 'Forbidden' });

	try {
		const updatedPost = await Post.findByIdAndUpdate(
			postId,
			{ $set: formData },
			{ new: true }
		);

		res.status(200).send(updatedPost);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const removePost = async (req, res) => {
	const { postId } = req.params;
	const user = req.user;

	try {
		const post = await Post.findById(postId);
		if (post.authorId !== user._id)
			return res.status(403).send({ message: 'Forbidden' });

		await Post.deleteOne({ _id: postId });

		res.status(200).send({ message: 'Post deleted' });
	} catch (error) {
		res.status(400).send(error);
	}
};

export const likePost = async (req, res) => {
	const { postSlug } = req.params;
	const { _id: userId } = req.user;

	try {
		const post = await Post.findOne({ slug: postSlug });
		const likeArray = post.likes;

		if (!likeArray.includes(userId)) {
			likeArray.push(userId);
		} else {
			likeArray.splice(likeArray.indexOf(userId), 1);
		}

		const updatedPost = await Post.findOneAndUpdate(
			{ slug: postSlug },
			{ $set: { likes: likeArray } },
			{ new: true }
		);

		res.status(200).send(updatedPost);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const savePost = async (req, res) => {
	const { postId } = req.params;
	const { _id } = req.user;

	try {
		const user = await User.findById(_id).lean();
		if (user.saved.includes(postId)) {
			return res.status(400).send({ message: 'Post already saved' });
		}
		const updatedUser = await User.updateOne(
			{ _id: user._id },
			{ $push: { saved: postId } }
		);
		res.status(200).send(updatedUser);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const unSavePost = async (req, res) => {
	const { postId } = req.params;
	const { _id } = req.user;

	try {
		const user = await User.findById(_id).lean();

		const indexOfPostId = user.saved.findIndex((id) => id === postId);
		if (indexOfPostId < 0)
			return res.status(400).send({ message: 'Post not saved' });

		const savedPosts = user.saved;
		savedPosts.splice(indexOfPostId, 1);

		const updatedUser = await User.findByIdAndUpdate(user._id, {
			$set: { saved: savedPosts },
		}).lean();

		const { password, ...userInfo } = updatedUser;

		const newToken = createToken(userInfo);

		res.status(200).send(newToken);
	} catch (error) {
		res.status(400).send(error);
	}
};

export const searchPosts = async (req, res) => {
	const { q: searchTerm } = req.query;

	try {
		const postList = await Post.find({
			slug: {
				$regex: new RegExp(searchTerm),
				$options: 'i',
			},
		}).sort({ createdAt: -1 });

		return res.status(200).send(postList);
	} catch (error) {
		console.log(error);
		res.status(400).send(error);
	}
};
