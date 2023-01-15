import cassandra from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
import { IConversation } from '../../../entities/IConversation';
import { IConversationsRepository } from '../interfaces/IConversationsRepository';

class ConversationsRepository implements IConversationsRepository {
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

  public async readConversation({
    conversationid,
  }: IConversation): Promise<cassandra.types.Row> {
    try {
      const query = `SELECT * FROM chat.conversation WHERE conversationid = ?`;

      const result = await this.client.execute(query, [conversationid], {
        prepare: true,
      });

      return result.rows[0];
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllConversations(): Promise<cassandra.types.Row[]> {
    try {
      const query = `SELECT * FROM chat.conversation`;

      const result = await this.client.execute(query);

      return result.rows;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllConversationsByUsers(
    user1: string,
    user2: string,
  ): Promise<cassandra.types.Row[]> {
    try {
      const query = `SELECT * FROM chat.conversation WHERE users CONTAINS ? AND users CONTAINS ? ALLOW FILTERING`;

      const result = await this.client.execute(query, [user1, user2], {
        prepare: true,
      });

      return result.rows;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllConversationsByUserId(
    userid: string,
  ): Promise<cassandra.types.Row[]> {
    try {
      const query = `SELECT * FROM chat.conversation WHERE users CONTAINS ? ALLOW FILTERING`;

      const result = await this.client.execute(query, [userid], {
        prepare: true,
      });

      return result.rows;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  // public async addConversationMessage({
  //   conversationid,
  //   messages,
  // }: IConversation): Promise<void | cassandra.types.ResultSet> {
  //   try {
  //     const conversationActually = await this.readConversation({
  //       conversationid,
  //     });

  //     messages?.forEach((message) => {
  //       conversationActually.messages.push(message);
  //     });

  //     const query = `UPDATE chat.conversation SET messages = ? WHERE conversationID = ?`;

  //     const result = await this.client.execute(
  //       query,
  //       [[...conversationActually.messages], conversationid],
  //       {
  //         prepare: true,
  //       },
  //     );

  //     return result;
  //   } catch (err: any) {
  //     console.log(err);
  //     throw new Error(err);
  //   }
  // }

  // public async removeConversationMessage({
  //   conversationid,
  //   messages,
  // }: IConversation): Promise<void | cassandra.types.ResultSet> {
  //   try {
  //     const conversationActually = await this.readConversation({
  //       conversationid,
  //     });

  //     const messagesFilter = messages || [];

  //     const filterMessages = conversationActually.messages.filter(
  //       (message) => message.messageid !== messagesFilter[0].messageid,
  //     );

  //     const query = `UPDATE chat.conversation SET messages = ? WHERE conversationID = ?`;

  //     const result = await this.client.execute(
  //       query,
  //       [[...filterMessages], conversationid],
  //       {
  //         prepare: true,
  //       },
  //     );

  //     return result;
  //   } catch (err: any) {
  //     console.log(err);
  //     throw new Error(err);
  //   }
  // }

  public async deleteConversation({
    conversationid,
  }: IConversation): Promise<void | cassandra.types.ResultSet> {
    try {
      const query = `DELETE * FROM chat.conversation WHERE conversationid = ?`;

      const result = await this.client.execute(query, [conversationid], {
        prepare: true,
      });

      return result;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async createConversation({
    messages,
    users,
  }: IConversation): Promise<string> {
    try {
      const id = uuidv4();
      const messagesFilter = messages || [];
      const usersFilter = users || [];

      const query = `INSERT INTO chat.conversation (conversationid, messages, users, datehour) VALUES (?, ?, ?, ?)`;

      await this.client.execute(
        query,
        [id, [...messagesFilter], [...usersFilter], new Date(Date.now())],
        { prepare: true },
      );

      return id;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async updateConversation({
    messages,
    conversationid,
  }: IConversation): Promise<void | cassandra.types.ResultSet> {
    try {
      const messagesFilter = messages || [];

      const query = `UPDATE chat.conversation SET messages = ? WHERE conversationID = ?`;

      const result = await this.client.execute(
        query,
        [[...messagesFilter], conversationid],
        {
          prepare: true,
        },
      );

      return result;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }
}

export default new ConversationsRepository();
