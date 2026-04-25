import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";
import { FriendRequestStatus } from "@/models/friend-request.model";
import { PartialProfile } from "@/types/friend";

export interface Profile {
  _id: string;
  name: string;
  username: string;
  email: string;

  servers: string[];
  channels: string[];

  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockUntil?: string;

  isDeleted?: boolean;
  deletedAt?: string;
  reActivateAvailableAt?: string;

  avatar?: IFile;

  createdAt?: string;
  updatedAt?: string;
}

export interface Server {
  _id: string;

  name: string;
  logo: string;
  inviteCode: string;

  profileId: string;
  members: Member[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;

  role: MemberRole;
  profileId: string;
  serverId?: string;

  profile: Profile;

  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;

  name: string;
  private: boolean;

  serverId: string;
  profileId: string;

  privateMembers?: (Member & { profile: Profile })[];

  channels?: Channel[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  _id: string;

  name: string;
  type: ChannelType;
  serverId: string;
  profileId: string;

  categoryId?: string;
  category?: Category;

  createdAt?: string;
  updatedAt?: string;
}

export interface IFile {
  public_id?: string;
  url?: string;
  size?: number;
}

export interface Friendship {
  _id: string;

  user: PartialProfile;
  friend: PartialProfile;
  blockedBy: PartialProfile;

  createdAt: string;
}

export interface FriendRequest {
  _id: string;

  sender: string;
  receiver: string;
  status: FriendRequestStatus;
  pairKey: string;

  createdAt: string;
  updatedAt: string;
}
