import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";
import { FriendRequestStatus } from "@/models/friend-request.model";
import { MessageType } from "@/models/message.model";
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

  profile: PartialProfile;

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

export interface PartialConversation {
  _id: string;
  name?: string;
  logo?: IFile;
  participants?: PartialProfile[];
  admin?: string;
  type?: string;
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

export type ReplyMessage = {
  _id: string;
  content?: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    avatar?: IFile;
  };
  createdAt?: string;
};

export interface IMessage {
  _id: string;
  content?: string;

  conversation: PartialConversation;
  channel?: string;
  server?: string;

  replyTo?: ReplyMessage;

  edited?: boolean;
  isBot?: boolean;
  isAdmin?: boolean;
  pinned?: boolean;

  type: MessageType;

  visibleTo?: PartialProfile[];

  attachments?: IFile[];

  channelId?: string;
  serverId?: string;

  reactions?: {
    emoji: string;
    reactedByUserIds: string[];
  }[];

  createdAt?: string;
  updatedAt?: string;

  sender: PartialProfile;
}
