import express from 'express';
import authCtrl from '../controllers/authCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', authCtrl.register);

router.post('/login', authCtrl.login);

router.post('/login/google', authCtrl.googleLogin);

router.get('/me', auth, authCtrl.getCurrentUser);

router.post('/user/profile', auth, authCtrl.updateProfile);

router.post('/user/password', auth, authCtrl.changePassword);

export default router;
