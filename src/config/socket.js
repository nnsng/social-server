import { Server } from 'socket.io';

const SOCKET_EVENTS = {
  SOCIAL: {
    JOIN: 'joinSocial',
    LEAVE: 'leaveSocial',
  },
  POST: {
    JOIN: 'joinPost',
    LEAVE: 'leavePost',
  },
  DISCONNECT: 'disconnect',
};

const socketServer = (socket) => {
  // user open website
  socket.on(SOCKET_EVENTS.SOCIAL.JOIN, ({ userId }) => {
    socket.join(userId);
  });
  socket.on(SOCKET_EVENTS.SOCIAL.LEAVE, ({ userId }) => {
    socket.leave(userId);
  });

  // user open a post
  socket.on(SOCKET_EVENTS.POST.JOIN, ({ postId }) => {
    socket.join(postId);
  });
  socket.on(SOCKET_EVENTS.POST.LEAVE, ({ postId }) => {
    socket.leave(postId);
  });

  // user disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
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
