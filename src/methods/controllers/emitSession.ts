import { Socket } from 'socket.io';

// Emit Session to Client
export const emitSession = (socket: Socket) => {
  socket.emit('session', {
    // sessionID: socket.sessionID,
    userid: socket.userid,
    username: socket.username,
  });
};
