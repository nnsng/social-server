import express from 'express';
import {
	createPost,
	getAll,
	getBySlug,
	getMyPosts,
	getPostForEdit,
	getSavedPostList,
	likePost,
	removePost,
	savePost,
	searchPosts,
	unSavePost,
	updatePost,
} from '../controllers/post.js';

const router = express.Router();

router.get('/', getAll);
router.get('/my', getMyPosts);
router.get('/saved', getSavedPostList);
router.get('/edit/:postId', getPostForEdit);
router.get('/search', searchPosts);
router.post('/create', createPost);
router.patch('/:postId/update', updatePost);
router.delete('/:postId', removePost);
router.get('/:postSlug', getBySlug);
router.post('/:postSlug/like', likePost);
router.post('/:postId/save', savePost);
router.post('/:postId/un-save', unSavePost);

export default router;
