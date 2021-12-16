import express from 'express';
import commentCtrl from '../controllers/commentCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.delete('/:commentId', auth, commentCtrl.remove);

router.post('/:commentId/like', auth, commentCtrl.like);

router
	.route('/')
	.get(auth, commentCtrl.getByPostId)
	.post(auth, commentCtrl.create);

export default router;
