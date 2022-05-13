import express from 'express';
import userCtrl from '../controllers/userCtrl.js';

const userRouter = express.Router();

userRouter.get('/me', userCtrl.getCurrentUser);

userRouter.post('/update-profile', userCtrl.updateProfile);

userRouter.get('/:username', userCtrl.getUserInfo);

export default userRouter;
