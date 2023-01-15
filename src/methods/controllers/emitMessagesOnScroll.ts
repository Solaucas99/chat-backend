import { Socket } from 'socket.io';
import MessagesRepository from '../../storage/repositories/conversation/implementations/MessagesRepository';

// This method emit all users for the client when it's requested
export const emitMessagesOnScroll = (socket: Socket) => {
  socket.on('GET:messageOnScroll:req', async ({ conversationid, page }) => {
    const messagesState =
      await MessagesRepository.readAllMessagesByConversation(
        conversationid,
        20,
        page,
      );

    socket.emit('GET:messageOnScroll:res', {
      ...messagesState,
      result: messagesState.result.sort(
        (prevMessage, nextMessage) =>
          new Date(prevMessage.datehour).getTime() -
          new Date(nextMessage.datehour).getTime(),
      ),
      finished: messagesState.result.length < 30,
    });
  });
};
