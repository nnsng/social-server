import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import socketServer from './config/socket.js';
import authRoute from './routes/authRoute.js';
import commentRoute from './routes/commentRoute.js';
import postRoute from './routes/postRoute.js';
import auth from './middlewares/auth.js';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Socket.io
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

io.on('connection', (socket) => {
	socketServer(socket, io);
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', auth, postRoute);
app.use('/api/comments', auth, commentRoute);

// Database
const URI = process.env.MONGODB_URI;
mongoose.connect(
	URI,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	(error) => {
		if (error) throw error;
		console.log('Connected to MongoDB');
	}
);

// Server listening
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
	console.log('Server is running on port', PORT);
});
