export interface IConversation {
  conversationid?: string; //uuid
  users?: string[]; //uuid
  messages?: string[]; //uuid
  datehour?: Date;
}
