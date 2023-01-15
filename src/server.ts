import { Socket } from 'socket.io';
import { SocketIoServer } from './App';
import { InMemorySessionStore } from './SessionStore';
import UsersRepository from './storage/repositories/conversation/implementations/UsersRepository';
import { authMiddleware } from './methods/middlewares/authMiddleware';

import { emitAllUsers } from './methods/controllers/emitAllUsers';
import { emitConnectedUserData } from './methods/controllers/emitConnectedUserData';
import { emitSession } from './methods/controllers/emitSession';
import { emitUserConnected } from './methods/controllers/emitUserConnected';
import { emitUserWithUsername } from './methods/controllers/emitUserWithUsername';
import { onChatMessage } from './methods/controllers/onChatMessage';
import { saveSocketID } from './methods/controllers/saveSocketId';
import { emitMessagesOnScroll } from './methods/controllers/emitMessagesOnScroll';

// SocketIO Server
const classApp = new SocketIoServer();

// Memory Session Storage
const sessionStore = new InMemorySessionStore();

// This method emit all users logged on socket now
const emitUsers = (socket: Socket) => {
  const users = classApp.usersInSocket();
  socket.emit('users', users);
};

// This method save session on memory storage
const saveSession = (socket: Socket) => {
  sessionStore.saveSession(socket.sessionID, {
    userid: socket.userid,
    username: socket.username,
    userSocketId: socket.id,
    connected: true,
  });
  const sessionsOnline = sessionStore.findAllSessions();
  console.log(sessionsOnline, 'atNow');
};

// On Disconnection Method
const onConnect = (socket: Socket) => {
  socket.broadcast.emit('user connected', {
    userid: socket.userid,
    username: socket.username,
    socketid: socket.id,
  });
};

const typingCheck = (socket: Socket) => {
  socket.on('userIsTyping', (id) => console.log(id));
  socket.on('userStoppedTyping', (id) => console.log(id));
};

// On Disconnection Method
const onDisconnect = (socket: Socket) => {
  socket.on('disconnect', async () => {
    const matchingSockets = await classApp.findUserInSockets(socket.userid);
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      await UsersRepository.updateUser({
        userid: socket.userid,
        socketid: '0',
      });
      // notify other users
      socket.broadcast.emit('user disconnected', {
        userid: socket.userid,
        username: socket.username,
      });
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userid,
        username: socket.username,
        connected: false,
      });
    }
  });
};

/////////////////////////////////////////////////////////////////////

// Subscribing observers to Socket IO Server
classApp.subscribeObserversMethods(
  saveSession,
  emitUsers,
  onDisconnect,
  onConnect,
  typingCheck,
  emitAllUsers,
  emitConnectedUserData,
  emitSession,
  emitUserConnected,
  emitUserWithUsername,
  emitMessagesOnScroll,
  onChatMessage,
  saveSocketID,
);

// Subscribing middlewares to Socket IO Server
classApp.subscribeObserversMiddlewares(authMiddleware);

// Notifying methods && middlewares
classApp.notifyAllMethods();
classApp.notifyAllMiddlewares();
