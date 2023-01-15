import { Socket } from 'socket.io';
import ConversationsRepository from '../../storage/repositories/conversation/implementations/ConversationsRepository';
import MessagesRepository from '../../storage/repositories/conversation/implementations/MessagesRepository';
import UsersRepository from '../../storage/repositories/conversation/implementations/UsersRepository';

// This method emit all user data (conversations, friendships, messages and all) at connection time to client.
export const emitConnectedUserData = async (socket: Socket) => {
  socket.on('GET:connectedUserData:req', async () => {
    // Getting the connected user id
    const userid = socket.userid;

    // Finding user on Database
    const user = await UsersRepository.readUser({ userid });

    if (user) {
      // If user was found, search for conversations also on Database
      const conversations: any[] =
        await ConversationsRepository.readAllConversationsByUserId(userid);

      if (conversations && conversations.length > 0) {
        // If has conversations, make a map on conversations array
        const conversationMap = await Promise.all(
          conversations.map(async (conversation) => {
            // Getting users id's on the conversation except the connected user
            const conversationsUsersIds = conversation
              .get('users')
              .filter((user) => user.toString() !== userid);

            // Finding all participant users of this conversation except the connected user on Database
            const users = await Promise.all(
              conversationsUsersIds.map(async (convUserId) => {
                const user = await UsersRepository.readUser({
                  userid: convUserId.toString(),
                });

                return {
                  userid: user.get('userid').toString(), //uuid
                  username: user.get('username'),
                  socketid: user.get('socketid'),
                };
              }),
            );

            const messagesState =
              await MessagesRepository.readAllMessagesByConversation(
                conversation.get('conversationid').toString(),
                20,
              );

            // Return users and messages founded on Database and also filtered the messages by date/hour
            return {
              conversationid: conversation.get('conversationid').toString(),
              messages: messagesState.result.sort(
                (prevMessage, nextMessage) =>
                  new Date(prevMessage.datehour).getTime() -
                  new Date(nextMessage.datehour).getTime(),
              ),
              paginationState: messagesState.page,
              users,
            };
          }),
        );

        // Structuring a JS object from the processed data
        const obj = {
          userId: user.get('userid').toString(),
          userSocketId: socket.id,
          userData: {
            username: user.get('username').toString(),
            conversations: conversationMap.sort(
              (prevConv, nextConv) =>
                new Date(nextConv.messages.slice(-1)[0].datehour).getTime() -
                new Date(prevConv.messages.slice(-1)[0].datehour).getTime(),
            ),
            friendships: user.get('friendships'),
          },
          userSignUpDate: user.get('datehour'),
        };

        socket.emit('GET:connectedUserData:res', obj);

        return;
      }
    }

    // if user hadn't conversations
    const obj = {
      userId: user.get('userid').toString(),
      userSocketId: socket.id,
      userData: {
        username: user.get('username').toString(),
        conversations: [],
        friendships: user.get('friendships'),
      },
      userSignUpDate: user.get('datehour'),
    };

    socket.emit('GET:connectedUserData:res', obj);
  });
};
