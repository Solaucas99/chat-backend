export interface IMessage {
  messageid?: string; //uuid
  messageowner?: string; //uuid
  messagedestination?: string; //uuid
  messagetext?: string;
  conversationid?: string; //uuid
  datehour?: Date | string;
}
