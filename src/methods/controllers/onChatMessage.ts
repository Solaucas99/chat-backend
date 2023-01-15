import { Socket } from 'socket.io';
import ConversationsRepository from '../../storage/repositories/conversation/implementations/ConversationsRepository';
import MessagesRepository from '../../storage/repositories/conversation/implementations/MessagesRepository';
import UsersRepository from '../../storage/repositories/conversation/implementations/UsersRepository';

// Hearding Chat Messages Received
export const onChatMessage = (socket: Socket) => {
  socket.on(
    'chatMessage',
    async ({ from, message, userid, conversationid }) => {
      // Finding sender user data on Database
      const userFrom = await UsersRepository.readUser({ userid: from });

      // Finding recipient user data on Database
      const userTo = await UsersRepository.readUser({ userid: userid });

      // If Conversation already exists...
      if (conversationid) {
        // Finding the conversation on Database
        const conversation = await ConversationsRepository.readConversation({
          conversationid: conversationid,
        });

        // If the users and conversation was found
        if (userFrom && userTo && conversation) {
          // Create the message on Database
          const messageCreatedId = await MessagesRepository.createMessage({
            messagedestination: userid,
            messageowner: from,
            messagetext: message,
            conversationid: conversationid,
          });

          // If message was created successfully
          if (messageCreatedId) {
            // Get Conversation Messages
            const conversationsMessages = conversation
              .get('messages')
              .map((message) => message.toString());

            // Update the conversation with new message created
            await ConversationsRepository.updateConversation({
              messages: [...conversationsMessages, messageCreatedId],
              conversationid,
            });

            // Get recipient user updated data
            const userToUpdated = await UsersRepository.readUser({
              userid: userid,
            });

            // Get created message data
            const messageCreated = await MessagesRepository.readMessage({
              messageid: messageCreatedId,
            });

            // Emiting sender notification that message was successfully sent
            socket.emit('chatMessageSuccess', messageCreated);

            // If recipient user is online, send the realtime message
            if (userToUpdated.get('socketid')) {
              socket
                .to(userToUpdated.get('socketid'))
                .emit('chatMessageSuccess', messageCreated);
            }
          }
        }

        return;
      }

      // If the users was found and conversation didn't exists...
      if (userFrom && userTo && !conversationid) {
        // Create a new conversation for this 2 users
        const conversationId = await ConversationsRepository.createConversation(
          {
            users: [from, userid],
            messages: [],
          },
        );

        // Get the conversations of sender
        const conversationsUserFrom: any[] =
          userFrom.get('conversations') || [];

        // Get the conversations of recipient
        const conversationsUserTo: any[] = userTo.get('conversations') || [];

        // Set the conversation ID on the users (sender and recipient) conversations array
        await UsersRepository.updateUser({
          conversations: [...conversationsUserFrom, conversationId],
          userid: from,
        });

        await UsersRepository.updateUser({
          conversations: [...conversationsUserTo, conversationId],
          userid: userid,
        });

        // Create the message on Database
        const messageCreatedId = await MessagesRepository.createMessage({
          messagedestination: userid,
          messageowner: from,
          messagetext: message,
          conversationid: conversationId,
        });

        // If message was created successfully
        if (messageCreatedId) {
          await ConversationsRepository.updateConversation({
            messages: [messageCreatedId],
            conversationid: conversationId,
          });

          // Get recipient user updated data
          const userToUpdated = await UsersRepository.readUser({
            userid: userid,
          });

          // Get created message data
          const messageCreated = await MessagesRepository.readMessage({
            messageid: messageCreatedId,
          });

          // Emiting sender notification that message was successfully sent
          socket.emit('chatMessageSuccess', messageCreated);

          // If recipient user is online, send the realtime message
          if (userToUpdated.get('socketid')) {
            socket
              .to(userToUpdated.get('socketid'))
              .emit('chatMessageSuccess', messageCreated);
          }
        }
      }
    },
  );
};
