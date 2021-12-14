import express from 'express';
import postCtrl from '../controllers/postCtrl.js';

const router = express.Router();

router.get('/search', postCtrl.searchPosts);

router.get('/my', postCtrl.getMyPosts);

router.get('/saved', postCtrl.getSavedPostList);

router.get('/detail/:postSlug', postCtrl.getBySlug);

router.post('/:postSlug/like', postCtrl.likePost);

router.post('/:postId/save', postCtrl.savePost);

router.post('/:postId/un-save', postCtrl.unSavePost);

router
	.route('/:postId')
	.get(postCtrl.getPostForEdit)
	.patch(postCtrl.updatePost)
	.delete(postCtrl.removePost);

router.route('/').get(postCtrl.getAll).post(postCtrl.createPost);

export default router;
