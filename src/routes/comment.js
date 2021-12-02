import express from 'express';
import {
	createComment,
	getPostComment,
	likeComment,
	removeComment,
} from '../controllers/comment.js';

const router = express.Router();

router.post('/', createComment);
router.get('/:postId', getPostComment);
router.delete('/:commentId', removeComment);
router.post('/:commentId/like', likeComment);

export default router;
