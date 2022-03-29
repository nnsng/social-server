import express from 'express';
import adminCtrl from '../controllers/adminCtrl.js';

const router = express.Router();

router.post('/users/:userId/role', adminCtrl.setRole);

router.get('/updateDb', adminCtrl.updateDb);

export default router;
