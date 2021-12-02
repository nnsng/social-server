import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
	{
		_id: { type: String, unique: true, required: true },
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
		_id: false,
		timestamps: true,
	}
);

export default mongoose.model('Comment', commentSchema);
