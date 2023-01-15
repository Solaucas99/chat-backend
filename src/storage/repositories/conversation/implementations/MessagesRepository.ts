import cassandra from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
import { IMessage } from '../../../entities/IMessage';
import { IMessagesRepository } from '../interfaces/IMessagesRepository';

class MessagesRepository implements IMessagesRepository {
  private authProvider: cassandra.auth.PlainTextAuthProvider;
  // Replace the PublicIPs with the IP addresses of your clusters
  private contactPoints: string[] = [];
  // Replace DataCenter with the name of your data center, for example: 'AWS_VPC_US_EAST_1'
  private localDataCenter: string;

  private client: cassandra.Client;

  constructor() {
    // Replace 'Username' and 'Password' with the username and password from your cluster settings
    this.authProvider = new cassandra.auth.PlainTextAuthProvider(
      'cassandra',
      'cassandra',
    );
    this.contactPoints.push('127.0.0.1');
    this.localDataCenter = 'datacenter1';
    this.client = new cassandra.Client({
      contactPoints: this.contactPoints,
      authProvider: this.authProvider,
      localDataCenter: this.localDataCenter,
      keyspace: 'chat',
    });
  }

  public async readMessage({
    messageid,
  }: IMessage): Promise<cassandra.types.Row> {
    try {
      const query = `SELECT * FROM chat.message WHERE messageid = ? ALLOW FILTERING`;

      const result = await this.client.execute(query, [messageid], {
        prepare: true,
      });

      return result.rows[0];
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllMessages(): Promise<cassandra.types.Row[]> {
    try {
      const query = `SELECT * FROM chat.message`;

      const result = await this.client.execute(query);

      return result.rows;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllMessagesByUser(
    userid: string,
  ): Promise<cassandra.types.Row[]> {
    try {
      const query1 = `SELECT * FROM chat.message WHERE messageowner = ? ALLOW FILTERING`;
      const query2 = `SELECT * FROM chat.message WHERE messagedestination = ? ALLOW FILTERING`;

      const result1 = await this.client.execute(query1, [userid], {
        prepare: true,
      });

      const result2 = await this.client.execute(query2, [userid], {
        prepare: true,
      });

      return [...result1.rows, ...result2.rows];
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllMessagesByConversation(
    conversationid: string,
    limit?: number,
    pageState?: string,
  ): Promise<any> {
    try {
      const query = `SELECT * FROM chat.message WHERE conversationid = ? ALLOW FILTERING`;

      const result = await this.client.execute(query, [conversationid], {
        prepare: true,
        fetchSize: limit || 100,
        pageState: pageState || undefined,
      });

      return {
        result: [...result.rows],
        page: result.pageState,
      };
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async deleteMessage({
    messageid,
  }: IMessage): Promise<void | cassandra.types.ResultSet> {
    try {
      const query = `DELETE * FROM chat.message WHERE messageid = ?`;

      const result = await this.client.execute(query, [messageid], {
        prepare: true,
      });

      return result;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async createMessage({
    messagedestination,
    messageowner,
    messagetext,
    conversationid,
  }: IMessage): Promise<void | string> {
    try {
      const query = `INSERT INTO chat.message (messageid, messageowner, messagedestination, messagetext, conversationid, datehour) VALUES (?, ?, ?, ?, ?, ?)`;
      const msgId = uuidv4();
      const dateNow = new Date(Date.now());

      await this.client.execute(
        query,
        [
          msgId,
          messageowner,
          messagedestination,
          messagetext,
          conversationid,
          dateNow,
        ],
        { prepare: true },
      );

      return msgId;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }
}

export default new MessagesRepository();
