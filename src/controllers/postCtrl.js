import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { getPostResponse } from '../utils/mongoose.js';

const getAll = async (req, res) => {
	try {
		const params = req.query;

		const getFilter = ({ tag, username }) => {
			if (tag && username)
				return { 'tags.value': tag, 'author.username': username };
			if (tag) return { 'tags.value': tag };
			if (username) return { 'author.username': username };

			return {};
		};

		const filter = getFilter(params);
		const postResponse = await getPostResponse(filter, params);

		res.send(postResponse);
	} catch (error) {
		res.status(500).send(error);
	}
};

const getBySlug = async (req, res) => {
	try {
		const { postSlug } = req.params;

		const post = await Post.findOne({ slug: postSlug }).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		const commentCount = await Comment.countDocuments({ postId: post._id });

		res.send({ ...post, commentCount });
	} catch (error) {
		res.status(500).send(error);
	}
};

const getForEdit = async (req, res) => {
	try {
		const { postId } = req.params;
		const user = req.user;

		const post = await Post.findById(postId).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		res.send(post);
	} catch (error) {
		res.status(500).send(error);
	}
};

const getMyPostList = async (req, res) => {
	try {
		const params = req.query;
		const user = req.user;

		const filter = { authorId: user._id };
		const postResponse = await getPostResponse(filter, params);

		res.send(postResponse);
	} catch (error) {
		res.status(500).send(error);
	}
};

const getSavedList = async (req, res) => {
	try {
		const params = req.query;
		const { saved } = req.user;

		const filter = { _id: { $in: saved } };
		const postResponse = await getPostResponse(filter, params);

		res.send(postResponse);
	} catch (error) {
		res.status(500).send(error);
	}
};

const create = async (req, res) => {
	try {
		const formData = req.body;
		const { _id, name, avatar } = req.user;

		const newPost = new Post({
			...formData,
			author: {
				_id,
				name,
				avatar,
			},
		});

		const savedPost = await newPost.save();

		res.send(savedPost?._doc);
	} catch (error) {
		console.log('~ error', error);
		res.status(500).send(error);
	}
};

const update = async (req, res) => {
	try {
		const { postId } = req.params;
		const formData = req.body;
		const user = req.user;

		if (user.role !== 'admin' && !formData.authorId.equals(user._id))
			return res.status(400).send('You are not authorized to edit this post');

		const updatedPost = await Post.findByIdAndUpdate(
			postId,
			{ $set: formData },
			{ new: true }
		).lean();

		res.send(updatedPost);
	} catch (error) {
		res.status(500).send(error);
	}
};

const remove = async (req, res) => {
	try {
		const { postId } = req.params;
		const user = req.user;

		const post = await Post.findById(postId).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		if (user.role !== 'admin' && !post.authorId.equals(user._id))
			return res.status(400).send('You are not authorized to delete this post');

		await Post.deleteOne({ _id: postId });
		await Comment.deleteMany({ postId });
		await User.updateMany(
			{ saved: { $in: [postId] } },
			{ $pull: { saved: postId } }
		);

		res.send({ message: 'Post deleted' });
	} catch (error) {
		res.status(500).send(error);
	}
};

const like = async (req, res) => {
	try {
		const { postSlug } = req.params;
		const { _id: userId } = req.user;

		const post = await Post.findOne({ slug: postSlug });
		if (!post) return res.status(404).send({ message: 'Post not found' });

		const isLiked = post.likes.includes(userId);

		const update = isLiked
			? { $pull: { likes: userId } }
			: { $push: { likes: userId } };

		const updatedPost = await Post.findOneAndUpdate(
			{ slug: postSlug },
			update,
			{ new: true }
		).lean();

		res.send(updatedPost);
	} catch (error) {
		res.status(500).send(error);
	}
};

const save = async (req, res) => {
	try {
		const { postId } = req.params;
		const user = req.user;

		const post = await Post.findById(postId).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		if (user.saved.includes(postId)) {
			return res.status(400).send({ message: 'Bài viết đã được lưu' });
		}

		await User.updateOne({ _id: user._id }, { $push: { saved: postId } });

		res.send({ message: 'Successfully' });
	} catch (error) {
		res.status(500).send(error);
	}
};

const unSave = async (req, res) => {
	try {
		const { postId } = req.params;
		const user = req.user;

		const post = await Post.findById(postId).lean();
		if (!post) return res.status(404).send({ message: 'Post not found' });

		const indexOfPostId = user.saved.findIndex((id) => id === postId);
		if (indexOfPostId < 0)
			return res.status(400).send({ message: 'Bài viết chưa được lưu' });

		const savedPosts = user?.saved;
		savedPosts.splice(indexOfPostId, 1);

		await User.updateOne(
			{ _id: user._id },
			{
				$set: { saved: savedPosts },
			},
			{ new: true }
		);

		res.send({ message: 'Successfully' });
	} catch (error) {
		res.status(500).send(error);
	}
};

const search = async (req, res) => {
	try {
		const { q: searchTerm } = req.query;

		const postList = await Post.find({
			slug: {
				$regex: new RegExp(searchTerm),
				$options: 'i',
			},
		}).sort({ createdAt: -1 });

		return res.send(postList);
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
};

const postCtrl = {
	getAll,
	getBySlug,
	getForEdit,
	getMyPostList,
	getSavedList,
	create,
	update,
	remove,
	like,
	save,
	unSave,
	search,
};

export default postCtrl;
