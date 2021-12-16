export const socketServer = (socket, io) => {
	socket.on('joinRoom', ({ id }) => {
		socket.join(id);
	});

	socket.on('outRoom', ({ id }) => {
		socket.leave(id);
	});

	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected');
	});
};
