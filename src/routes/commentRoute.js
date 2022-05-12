import express from 'express';
import commentCtrl from '../controllers/commentCtrl.js';

const commentRouter = express.Router();

commentRouter.post('/:commentId/like', commentCtrl.like);

commentRouter.delete('/:commentId', commentCtrl.remove);

commentRouter.route('/').get(commentCtrl.getByPostId).post(commentCtrl.create);

export default commentRouter;
