import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import UsersRepository from '../../storage/repositories/conversation/implementations/UsersRepository';

type Middleware = (err?: ExtendedError | undefined) => void;

export const authMiddleware = async (socket: Socket, next: Middleware) => {
  // Getting the userid sent by the client
  const userid = socket.handshake.auth.userid;

  // If userid really exists
  if (userid) {
    // Try to find the user on Database
    const user = await UsersRepository.readUser({ userid });

    // If user exists on Database
    if (user) {
      //Setting the username & userid from the Database and go to next
      socket.userid = user.get('userid').toString();
      socket.username = user.get('username').toString();
      return next();
    }
  }

  // Getting username sent by the client
  const username = socket.handshake.auth.username;

  // If not username was sent throw exception
  if (!username) {
    return next(new Error('Invalid username'));
  }

  // Finding the user on Database by username
  const usernameSearch = await UsersRepository.readUserByUsername({ username });

  // If user exists on Database
  if (usernameSearch) {
    //Setting the username & userid from the Database and go to next
    socket.userid = usernameSearch.get('userid').toString();
    socket.username = usernameSearch.get('username').toString();
    return next();
  }

  // If user didn`t exists on Database, create a user.
  const userCreation = await UsersRepository.createUser({ username });

  // If user creation failed, throw an exception
  if (!userCreation) {
    return next(new Error('Error on create'));
  }

  // Find the created user on Database
  const user = await UsersRepository.readUser({ userid: userCreation });

  //Setting the username & userid from the Database and go to next
  socket.userid = user.get('userid').toString();
  socket.username = user.get('username').toString();
  return next();
};
