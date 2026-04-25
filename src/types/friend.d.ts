import { FriendRequest, Profile } from "@/interface";

export type FriendWithSender = FriendRequest & {
  sender: PartialProfile;
};

export type FriendWithReciever = FriendRequest & {
  receiver: PartialProfile;
};

export type FriendWithRecieverAndSender = FriendRequest & {
  receiver: Pick<Profile, "_id" | "avatar" | "email" | "username" | "name">;
  sender: PartialProfile;
};

export type PopulatedFriendship = {
  _id: string;
  user: PartialProfile;
  friend: PartialProfile;
  createdAt: Date;
};

export type PartialFriendship = {
  _id: string;
  blockedBy: string;
  friend: PartialProfile;
  createdAt: Date;
};

export type PartialProfile = Pick<
  Profile,
  "_id" | "avatar" | "email" | "name" | "username"
>;
