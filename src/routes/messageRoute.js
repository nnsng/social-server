import express from 'express';
import messageCtrl from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/conversations', messageCtrl.getConversations);
messageRouter.get('/conversation/:conversationId', messageCtrl.getMessages);
messageRouter.get('/user/:userId', messageCtrl.getOrCreateConversationWithUser);
messageRouter.post('/', messageCtrl.sendMessage);
messageRouter.delete('/conversation/:conversationId', messageCtrl.deleteConversation);

export default messageRouter;
