import cassandra from 'cassandra-driver';
import { IMessage } from '../../../entities/IMessage';

export interface IMessagesRepository {
  createMessage({
    datehour,
    messagedestination,
    messageowner,
    messagetext,
    messageid,
  }: IMessage): Promise<string | void>;

  deleteMessage({
    messageid,
  }: IMessage): Promise<cassandra.types.ResultSet | void>;

  readMessage({ messageid }: IMessage): Promise<cassandra.types.Row>;

  readAllMessages(): Promise<cassandra.types.Row[]>;

  readAllMessagesByUser(userid: string): Promise<cassandra.types.Row[]>;
}
