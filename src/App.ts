import dotenv from 'dotenv';
import { Server, Socket } from 'socket.io';
// import { InMemorySessionStore } from './SessionStore';

type ObserverFunctionType = (...params: Array<any>) => void;
type usersArray = { userID: string; username: string; id: string }[];

export class SocketIoServer {
  // Init Server
  private io: Server = new Server(3001, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // State of methods (emit, join, on, etc...)
  private stateMethods: Array<(...params: Array<() => void>) => void> = [];

  // State of middlewares (emit, join, on, etc...)
  private stateMiddlewares: Array<(...params: Array<() => void>) => void> = [];

  constructor() {
    dotenv.config();
  }

  public usersInSocket(): usersArray {
    const users: usersArray = [];
    for (const [id, socket] of this.io.of('/').sockets) {
      users.push({
        userID: socket.userid,
        username: socket.username,
        id,
      });
    }
    return users;
  }

  public async findUserInSockets(socketUserId: string): Promise<Set<string>> {
    const sockets = await this.io.in(socketUserId).allSockets();
    return sockets;
  }

  // Middlewares
  public notifyAllMiddlewares(): void {
    this.io.use((socket, next) => {
      this.stateMiddlewares.forEach((middleware: ObserverFunctionType) => {
        middleware(socket, next);
      });
    });
  }

  // Principal Methods
  public notifyAllMethods(): void {
    this.io.on('connection', (socket: Socket) => {
      this.stateMethods.forEach((observer: ObserverFunctionType) => {
        observer(socket);
      });
    });
  }

  // Subscribe Method
  public subscribeObserversMethods(
    ...observers: Array<ObserverFunctionType>
  ): void {
    this.stateMethods.push(...observers);
  }

  // Subscribe Middleware
  public subscribeObserversMiddlewares(
    ...observers: Array<ObserverFunctionType>
  ): void {
    this.stateMiddlewares.push(...observers);
  }
}
