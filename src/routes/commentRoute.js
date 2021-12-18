import express from 'express';
import commentCtrl from '../controllers/commentCtrl.js';

const router = express.Router();

router.post('/:commentId/like', commentCtrl.like);

router.delete('/:commentId', commentCtrl.remove);

router.route('/').get(commentCtrl.getByPostId).post(commentCtrl.create);

export default router;
