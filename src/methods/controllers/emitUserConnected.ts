import { Socket } from 'socket.io';

// This method alert that user is online now
export const emitUserConnected = (socket: Socket) => {
  socket.broadcast.emit('user connected', {
    userid: socket.userid,
    username: socket.username,
  });
};
