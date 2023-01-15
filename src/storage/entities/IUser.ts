export interface IUser {
  userid?: string; //uuid
  username?: string;
  socketid?: string;
  conversations?: string[]; //uuid
  friendships?: string[]; //uid
  datehour?: Date;
}
