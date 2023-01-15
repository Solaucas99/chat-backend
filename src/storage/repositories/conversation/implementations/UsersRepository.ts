import cassandra from 'cassandra-driver';
import { v4 as uuidv4 } from 'uuid';
import { IUser } from '../../../entities/IUser';
import { IUsersRepository } from '../interfaces/IUsersRepository';

class UsersRepository implements IUsersRepository {
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

  public async readUser({ userid }: IUser): Promise<cassandra.types.Row> {
    try {
      const query = `SELECT * FROM chat.user WHERE userid = ?`;

      const result = await this.client.execute(query, [userid], {
        prepare: true,
      });

      return result.rows[0];
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readUserByUsername({
    username,
  }: IUser): Promise<cassandra.types.Row> {
    try {
      const query = `SELECT * FROM chat.user WHERE username = ? ALLOW FILTERING`;

      const result = await this.client.execute(query, [username], {
        prepare: true,
      });

      return result.rows[0];
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async readAllUsers(): Promise<cassandra.types.Row[]> {
    try {
      const query = `SELECT * FROM chat.user`;

      const result = await this.client.execute(query);

      return result.rows;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  // public async addUserUser({
  //   Userid,
  //   Users,
  // }: IUser): Promise<void | cassandra.types.ResultSet> {
  //   try {
  //     const UserActually = await this.readUser({
  //       Userid,
  //     });

  //     Users?.forEach((User) => {
  //       UserActually.Users.push(User);
  //     });

  //     const query = `UPDATE chat.User SET Users = ? WHERE UserID = ?`;

  //     const result = await this.client.execute(
  //       query,
  //       [[...UserActually.Users], Userid],
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

  // public async removeUserUser({
  //   Userid,
  //   Users,
  // }: IUser): Promise<void | cassandra.types.ResultSet> {
  //   try {
  //     const UserActually = await this.readUser({
  //       Userid,
  //     });

  //     const UsersFilter = Users || [];

  //     const filterUsers = UserActually.Users.filter(
  //       (User) => User.Userid !== UsersFilter[0].Userid,
  //     );

  //     const query = `UPDATE chat.User SET Users = ? WHERE UserID = ?`;

  //     const result = await this.client.execute(
  //       query,
  //       [[...filterUsers], Userid],
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

  public async deleteUser({
    userid,
  }: IUser): Promise<void | cassandra.types.ResultSet> {
    try {
      const query = `DELETE * FROM chat.user WHERE userid = ?`;

      const result = await this.client.execute(query, [userid], {
        prepare: true,
      });

      return result;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async createUser({ username }: IUser): Promise<void | string> {
    try {
      const userId = uuidv4();
      const query = `INSERT INTO chat.user (userid, username, datehour) VALUES (?, ?, ?)`;
      const dateHour = new Date(Date.now());

      await this.client.execute(query, [userId, username, dateHour], {
        prepare: true,
      });

      return userId;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }

  public async updateUser({
    conversations,
    friendships,
    username,
    userid,
    socketid,
  }: IUser): Promise<void | cassandra.types.ResultSet> {
    try {
      const conversationsFilter = conversations || [];
      const friendshipsFilter = friendships || [];
      const usernameFilter = username || '';

      if (conversationsFilter.length > 0) {
        const query = `UPDATE chat.user SET conversations = ? WHERE UserID = ?`;

        const result = await this.client.execute(
          query,
          [[...conversationsFilter], userid],
          {
            prepare: true,
          },
        );

        return result;
      }

      if (friendshipsFilter.length > 0) {
        const query = `UPDATE chat.user SET friendships = ? WHERE UserID = ?`;

        const result = await this.client.execute(
          query,
          [[...friendshipsFilter], userid],
          {
            prepare: true,
          },
        );

        return result;
      }

      if (usernameFilter) {
        const query = `UPDATE chat.user SET username = ? WHERE UserID = ?`;

        const result = await this.client.execute(
          query,
          [usernameFilter, userid],
          {
            prepare: true,
          },
        );

        return result;
      }

      if (socketid) {
        const query = `UPDATE chat.user SET socketid = ? WHERE UserID = ?`;

        const result = await this.client.execute(query, [socketid, userid], {
          prepare: true,
        });

        return result;
      }
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }
}

export default new UsersRepository();
