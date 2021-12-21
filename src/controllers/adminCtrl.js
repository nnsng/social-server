import Post from '../models/Post.js';
import User from '../models/User.js';

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
	updateDb,
};

export default adminCtrl;
