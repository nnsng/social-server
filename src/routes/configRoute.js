import express from 'express';
import configCtrl from '../controllers/configCtrl.js';

const configRouter = express.Router();

configRouter.get('/get-top-hashtags', configCtrl.getTopHashtags);

export default configRouter;
