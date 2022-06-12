import express from 'express';
import adminCtrl from '../controllers/adminCtrl.js';

const adminRouter = express.Router();

adminRouter.post('/role', adminCtrl.setRole);

adminRouter.get('/updateDb', adminCtrl.updateDb);

adminRouter.get('/create-mock', adminCtrl.createMockData);

export default adminRouter;
