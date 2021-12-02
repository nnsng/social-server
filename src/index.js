import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import verifyToken from './middlewares/verifyToken.js';
import authRoute from './routes/auth.js';
import commentRoute from './routes/comment.js';
import postRoute from './routes/post.js';
import { getUser, joinUser, leaveUser } from './utils/userSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', verifyToken, postRoute);
app.use('/api/comments', verifyToken, commentRoute);

// Connect to WebSocket
io.on('connection', (socket) => {
	socket.on('join', ({ userId, postId }) => {
		const user = joinUser(socket.id, userId, postId);
		socket.join(user.room);
	});

	socket.on('comment', ({ comment }) => {
		const user = getUser(socket.id);
		io.to(user?.room).emit('comment', { comment });
	});

	socket.on('leave', () => {
		const user = leaveUser(socket.id);

		if (!user) return;

		socket.leave(user.room);
	});
});

server.listen(PORT, () => {
	console.log('Server is running on port', PORT);

	// Connect to MongoDB
	mongoose.connect(
		process.env.MONGO_URI,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
		() => console.log('Connected to DB')
	);
});
