import express from 'express';
import adminCtrl from '../controllers/adminCtrl.js';

const adminRouter = express.Router();

adminRouter.post('/role', adminCtrl.setRole);

adminRouter.get('/updateDb', adminCtrl.updateDb);

export default adminRouter;
