import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";

export interface Profile {
  _id: string;
  name: string;
  email: string;
  password?: string;

  servers: string[];
  channels: string[];

  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockUntil?: string;

  isDeleted?: boolean;
  deletedAt?: string;
  reActivateAvailableAt?: string;

  avatar?: {
    public_id: string;
    url: string;
    size: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface Server {
  _id: string;

  name: string;
  logo: string;
  inviteCode: string;

  profileId: string;
  members: string[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;

  role: MemberRole;
  profileId: string;
  serverId?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  _id: string;

  name: string;
  type: ChannelType;
  serverId: string;
  profileId: string;

  createdAt?: string;
  updatedAt?: string;
}
