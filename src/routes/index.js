import { admin, auth } from '../middlewares/index.js';
import adminRouter from './adminRoute.js';
import authRouter from './authRoute.js';
import commentRouter from './commentRoute.js';
import postRouter from './postRoute.js';
import userRouter from './userRoute.js';

function initRoutes(app) {
  app.use('/api/auth', authRouter);
  app.use('/api/users', auth, userRouter);
  app.use('/api/posts', auth, postRouter);
  app.use('/api/comments', auth, commentRouter);
  app.use('/api/admin', admin, adminRouter);
}

export default initRoutes;
