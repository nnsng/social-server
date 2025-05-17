import express from 'express';
import notificationCtrl from '../controllers/notificationController.js';

const notificationRouter = express.Router();

notificationRouter.get('/', notificationCtrl.getAll);

// notificationRouter.post('/read', notificationCtrl.setRead);

export default notificationRouter;
