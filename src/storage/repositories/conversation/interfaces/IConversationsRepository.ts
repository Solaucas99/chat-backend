import cassandra from 'cassandra-driver';
import { IConversation } from '../../../entities/IConversation';

export interface IConversationsRepository {
  createConversation({
    datehour,
    messages,
    users,
  }: IConversation): Promise<string | void>;

  updateConversation({
    messages,
    conversationid,
  }: IConversation): Promise<cassandra.types.ResultSet | void>;

  deleteConversation({
    conversationid,
  }: IConversation): Promise<cassandra.types.ResultSet | void>;

  readConversation({
    conversationid,
  }: IConversation): Promise<cassandra.types.Row>;

  readAllConversations(): Promise<cassandra.types.Row[]>;

  readAllConversations(): Promise<cassandra.types.Row[]>;

  // addConversationMessage({
  //   conversationid,
  //   messages,
  // }: IConversation): Promise<cassandra.types.ResultSet | void>;

  // removeConversationMessage({
  //   conversationid,
  //   messages,
  // }: IConversation): Promise<cassandra.types.ResultSet | void>;
}
