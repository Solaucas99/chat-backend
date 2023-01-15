import { Socket } from 'socket.io';
import UsersRepository from '../../storage/repositories/conversation/implementations/UsersRepository';

// This method emit user filtering by username on database
export const emitUserWithUsername = (socket: Socket) => {
  socket.on('GET:userbyusername:req', async ({ username }) => {
    const user = await UsersRepository.readUserByUsername({
      username: username,
    });

    console.log(user);

    if (user) {
      const userObj = {
        userId: user.get('userid').toString(),
        userData: {
          username: user.get('username').toString(),
          conversations: user.get('conversations'),
          friendships: user.get('friendships'),
        },
        userSignUpDate: user.get('datehour'),
      };

      socket.emit('GET:userbyusername:res', userObj);
    }
  });
};
