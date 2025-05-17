import express from 'express';
import userCtrl from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/me', userCtrl.getCurrentUser);

userRouter.get('/search', userCtrl.search);

userRouter.post('/update', userCtrl.updateCurrentUser);

userRouter.post('/follow', userCtrl.follow);

userRouter.post('/unfollow', userCtrl.unfollow);

userRouter.get('/info/:username', userCtrl.getUserInfo);

export default userRouter;
