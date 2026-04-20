import { FriendRequest, IFile, Profile } from "@/interface";

export type FriendWithSender = FriendRequest & {
  sender: Pick<Profile, "_id" | "avatar" | "email" | "username" | "name">;
};

export type FriendWithReciever = FriendRequest & {
  receiver: Pick<Profile, "_id" | "avatar" | "email" | "username" | "name">;
};

export type FriendWithRecieverAndSender = FriendRequest & {
  receiver: Pick<Profile, "_id" | "avatar" | "email" | "username" | "name">;
  sender: Pick<Profile, "_id" | "avatar" | "email" | "username" | "name">;
};

export type PopulatedFriendship = {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
    name: string;
    avatar: IFile;
  };
  friend: {
    _id: string;
    username: string;
    email: string;
    name: string;
    avatar: IFile;
  };
  createdAt: Date;
};

export type PartialProfile = Pick<
  Profile,
  "_id" | "avatar" | "email" | "name" | "username"
>;
