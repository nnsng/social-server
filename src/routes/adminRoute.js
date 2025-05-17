import express from 'express';
import adminCtrl from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.post('/role', adminCtrl.setRole);

adminRouter.get('/update-db', adminCtrl.updateDb);

export default adminRouter;
