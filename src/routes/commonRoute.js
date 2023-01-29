import express from 'express';
import commonCtrl from '../controllers/commonCtrl.js';
import { auth } from '../middlewares/auth.js';

const commonRoute = express.Router();

commonRoute.get('/search', auth, commonCtrl.search);

export default commonRoute;
