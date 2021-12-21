import express from 'express';
import adminCtrl from '../controllers/adminCtrl.js';

const router = express.Router();

router.get('/', adminCtrl.updateDb);

export default router;
