import express from 'express';
import commentCtrl from '../controllers/commentCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.delete('/:commentId', auth, commentCtrl.removeComment);

router.post('/:commentId/like', auth, commentCtrl.likeComment);

router
	.route('/')
	.get(auth, commentCtrl.getPostComment)
	.post(auth, commentCtrl.createComment);

export default router;
