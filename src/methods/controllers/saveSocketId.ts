import { Socket } from 'socket.io';
import UsersRepository from '../../storage/repositories/conversation/implementations/UsersRepository';

// Saving Socket ID from user to database at connection time - for realtime messages
export const saveSocketID = async (socket: Socket) => {
  const user = await UsersRepository.readUser({ userid: socket.userid });

  if (user) {
    await UsersRepository.updateUser({
      socketid: socket.id,
      userid: socket.userid,
    });
  }
};
