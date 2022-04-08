import express from 'express';
import authCtrl from '../controllers/authCtrl.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', authCtrl.register);

router.post('/login', authCtrl.login);

router.post('/google-login', authCtrl.googleLogin);

router.post('/active', authCtrl.active);

router.get('/me', auth, authCtrl.getCurrentUser);

router.post('/update-profile', auth, authCtrl.updateProfile);

router.post('/change-password', auth, authCtrl.changePassword);

export default router;
