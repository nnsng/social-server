import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './config/database.js';
import { socketServer } from './config/socket.js';
import auth from './middlewares/auth.js';
import checkAdmin from './middlewares/checkAdmin.js';
import adminRoute from './routes/adminRoute.js';
import authRoute from './routes/authRoute.js';
import commentRoute from './routes/commentRoute.js';
import postRoute from './routes/postRoute.js';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Socket
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

io.on('connection', socketServer);

export { io };

// Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', auth, postRoute);
app.use('/api/comments', auth, commentRoute);
app.use('/api/admin', checkAdmin, adminRoute);

// Database
const URI = process.env.MONGODB_URI;
connectToDatabase(URI);

// Server listening
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log('Server is running on port', PORT);
});
