import express from 'express';
import chatCtrl from '../controllers/chatCtrl.js';

const chatRouter = express.Router();

chatRouter.post('/', chatCtrl.chat);

export default chatRouter;
