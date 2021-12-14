import { joinRoom, getUser, outRoom } from '../utils/userSocket.js';

function socketServer(socket, io) {
	socket.on('joinRoom', ({ userId, postId }) => {
		const user = joinRoom(socket.id, userId, postId);
		socket.join(user.room);
	});

	socket.on('comment', ({ comment }) => {
		const user = getUser(socket.id);
		io.to(user?.room).emit('comment', { comment });
	});

	socket.on('outRoom', () => {
		const user = outRoom(socket.id);

		if (!user) return;

		socket.leave(user.room);
	});

	socket.on('disconnect', () => {
		// console.log(socket.id + ' disconnected');
	});
}

export default socketServer;
