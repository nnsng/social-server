import express from 'express';
import postCtrl from '../controllers/postCtrl.js';

const postRouter = express.Router();

postRouter.get('/saved', postCtrl.getSaved);

postRouter.get('/detail/:slug', postCtrl.getBySlug);

postRouter.post('/:postId/like', postCtrl.like);

postRouter.post('/:postId/save', postCtrl.save);

postRouter.post('/:postId/unsave', postCtrl.unsave);

postRouter
  .route('/:postId')
  .get(postCtrl.getForEdit)
  .patch(postCtrl.update)
  .delete(postCtrl.remove);

postRouter.route('/').get(postCtrl.getAll).post(postCtrl.create);

export default postRouter;
