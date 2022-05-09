import express from 'express';
import postCtrl from '../controllers/postCtrl.js';

const router = express.Router();

router.get('/search', postCtrl.search);

router.get('/my', postCtrl.getMyList);

router.get('/saved', postCtrl.getSaved);

router.get('/detail/:slug', postCtrl.getBySlug);

router.post('/:postId/like', postCtrl.like);

router.post('/:postId/save', postCtrl.save);

router.post('/:postId/unsave', postCtrl.unsave);

router.route('/:postId').get(postCtrl.getForEdit).patch(postCtrl.update).delete(postCtrl.remove);

router.route('/').get(postCtrl.getAll).post(postCtrl.create);

export default router;
