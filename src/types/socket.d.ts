/* eslint-disable */
import * as socketio from 'socket.io';

declare module 'socket.io' {
 class Socket {
    userid: string;
    username: string;
    sessionID: string;
  }
}
