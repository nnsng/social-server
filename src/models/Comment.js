import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
	{
		postId: { type: String, required: true },
		content: { type: String, required: true },
		userId: { type: String, required: true },
		user: {
			_id: String,
			name: String,
			avatar: String,
		},
		likes: { type: [String], default: [] },
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Comment', commentSchema);
