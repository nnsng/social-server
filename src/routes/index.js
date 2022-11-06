import admin from '../middlewares/admin.js';
import auth from '../middlewares/auth.js';
import adminRouter from './adminRoute.js';
import authRouter from './authRoute.js';
import chatRouter from './chatRoute.js';
import commentRouter from './commentRoute.js';
import postRouter from './postRoute.js';
import userRouter from './userRoute.js';

function initRoutes(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', auth, userRouter);
  app.use('/api/posts', auth, postRouter);
  app.use('/api/comments', auth, commentRouter);
  app.use('/api/chat', auth, chatRouter);
  app.use('/api/admin', admin, adminRouter);
}

export default initRoutes;
