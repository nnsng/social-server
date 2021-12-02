import express from 'express';
import {
	changePassword,
	signInWithEmail,
	signInWithGoogle,
	signUpWithEmail,
	updateProfile,
} from '../controllers/auth.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

router.post('/signup', signUpWithEmail);
router.post('/signin/email', signInWithEmail);
router.post('/signin/google', signInWithGoogle);
router.post('/users/profile', verifyToken, updateProfile);
router.post('/users/password', verifyToken, changePassword);

export default router;
