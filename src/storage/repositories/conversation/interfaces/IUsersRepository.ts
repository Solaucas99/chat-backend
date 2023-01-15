import cassandra from 'cassandra-driver';
import { IUser } from '../../../entities/IUser';

export interface IUsersRepository {
  createUser({ username }: IUser): Promise<string | void>;

  updateUser({
    username,
    userid,
    friendships,
    conversations,
  }: IUser): Promise<cassandra.types.ResultSet | void>;

  deleteUser({ userid }: IUser): Promise<cassandra.types.ResultSet | void>;

  readUser({ userid }: IUser): Promise<cassandra.types.Row>;

  readUserByUsername({ userid }: IUser): Promise<cassandra.types.Row>;

  readAllUsers(): Promise<cassandra.types.Row[]>;

  // addUserMessage({
  //   Userid,
  //   messages,
  // }: IUser): Promise<cassandra.types.ResultSet | void>;

  // removeUserMessage({
  //   Userid,
  //   messages,
  // }: IUser): Promise<cassandra.types.ResultSet | void>;
}
