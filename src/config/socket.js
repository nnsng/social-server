import { Server } from 'socket.io';

const socketServer = (socket) => {
  // user open website
  socket.on('joinSocial', ({ userId }) => {
    socket.join(userId);
  });
  socket.on('leaveSocial', ({ userId }) => {
    socket.leave(userId);
  });

  // user open a post
  socket.on('joinPost', ({ postId }) => {
    socket.join(postId);
  });
  socket.on('leavePost', ({ postId }) => {
    socket.leave(postId);
  });

  // user disconnect
  socket.on('disconnect', () => {
    // console.log(socket.id + ' disconnected');
  });
};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', socketServer);
  return io;
};
