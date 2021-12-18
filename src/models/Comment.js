import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		user: {
			_id: mongoose.Schema.Types.ObjectId,
			name: String,
			avatar: String,
		},
		likes: {
			type: [mongoose.Schema.Types.ObjectId],
			default: [],
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Comment', commentSchema);
