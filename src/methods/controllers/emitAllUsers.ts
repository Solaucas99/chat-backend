import { Socket } from 'socket.io';
import UsersRepository from '../../storage/repositories/conversation/implementations/UsersRepository';

// This method emit all users for the client when it's requested
export const emitAllUsers = (socket: Socket) => {
  socket.on('GET:users:req', async () => {
    const allUsers = await UsersRepository.readAllUsers();
    const allUsersArr: any[] = [];

    allUsers.forEach((user) => {
      const userObj = {
        userId: user.get('userid').toString(),
        userData: {
          username: user.get('username').toString(),
          conversations: user.get('conversations'),
          friendships: user.get('friendships'),
        },
        userSignUpDate: user.get('datehour'),
      };

      allUsersArr.push(userObj);
    });

    socket.emit('GET:users:res', allUsersArr);
  });
};
