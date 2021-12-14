import mongoose from 'mongoose';
import slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

const postSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		description: { type: String, default: '' },
		thumbnail: { type: String, default: '' },
		authorId: { type: String, required: true },
		author: {
			_id: String,
			name: String,
			avatar: String,
			username: String,
		},
		tags: { type: [{ name: String, value: String }], default: [] },
		likes: { type: [String], default: [] },
		commentCount: { type: Number, default: 0 },
		slug: {
			type: String,
			slug: 'title',
			unique: true,
			slugOn: { findOneAndUpdate: true },
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Post', postSchema);
