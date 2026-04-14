import ChannelType from "@/enums/channel.enum";
import MemberRole from "@/enums/role.enum";

export interface Profile {
  _id: string;
  name: string;
  username: string;
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
  public_id: string;
  url: string;
  size: number;
}
