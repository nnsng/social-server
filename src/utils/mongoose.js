import Post from '../models/Post.js';

export const getPostResponse = async (filter, params) => {
	try {
		const { limit, page, sort, order } = params;

		const _limit = parseInt(limit) || 10;
		const _page = parseInt(page) || 1;
		const _sort = sort || 'createdAt';
		const _order = order || 'desc';

		const data = await Post.find(filter)
			.limit(_limit)
			.skip(_limit * (_page - 1))
			.sort({ [_sort]: _order })
			.lean();

		const count = await Post.countDocuments(filter);

		const pagination = {
			limit: _limit,
			page: _page,
			totalRows: count,
		};

		return { data, pagination };
	} catch (error) {
		throw error;
	}
};
