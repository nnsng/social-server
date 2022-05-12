import express from 'express';
import authCtrl from '../controllers/authCtrl.js';
import auth from '../middlewares/auth.js';

const authRouter = express.Router();

authRouter.post('/register', authCtrl.register);

authRouter.post('/login', authCtrl.login);

authRouter.post('/google-login', authCtrl.googleLogin);

authRouter.post('/active', authCtrl.active);

authRouter.get('/me', auth, authCtrl.getCurrentUser);

authRouter.post('/update-profile', auth, authCtrl.updateProfile);

authRouter.post('/change-password', auth, authCtrl.changePassword);

authRouter.post('/forgot-password', authCtrl.forgotPassword);

authRouter.post('/reset-password', authCtrl.resetPassword);

export default authRouter;
