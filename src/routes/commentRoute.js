import express from 'express';
import commentCtrl from '../controllers/commentController.js';

const commentRouter = express.Router();

commentRouter.post('/:commentId/like', commentCtrl.like);

commentRouter.patch('/:commentId', commentCtrl.edit);

commentRouter.delete('/:commentId', commentCtrl.remove);

commentRouter.route('/').get(commentCtrl.getByPostId).post(commentCtrl.create);

export default commentRouter;
