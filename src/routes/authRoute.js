import express from 'express';
import authCtrl from '../controllers/authController.js';
import { auth } from '../middleware/index.js';

const authRouter = express.Router();

authRouter.post('/register', authCtrl.register);

authRouter.post('/login', authCtrl.login);

authRouter.post('/google-login', authCtrl.googleLogin);

authRouter.post('/active', authCtrl.active);

authRouter.post('/reactive', authCtrl.reactive);

authRouter.post('/password/change', auth, authCtrl.changePassword);

authRouter.post('/password/forgot', authCtrl.forgotPassword);

authRouter.post('/password/reset', authCtrl.resetPassword);

export default authRouter;
