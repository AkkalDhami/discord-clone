import {
  Category,
  Channel,
  IFile,
  IMessage,
  Member,
  Server
} from "@/interface";
import { PartialProfile } from "@/types/friend";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ModalType =
  | "create-server"
  | "edit-server"
  | "leave-server"
  | "delete-server"
  | "invite-people"
  | "members"
  | "add-members"
  | "remove-member"
  | "create-channel"
  | "edit-channel"
  | "delete-channel"
  | "create-category"
  | "delete-category"
  | "edit-category"
  | "file-upload"
  | "new-chat"
  | "add-friend"
  | "remove-friend"
  | "block-friend"
  | "edit-group"
  | "delete-conversation"
  | "leave-group"
  | "kick-group-members"
  | "add-group-members"
  | "profile-sidebar"
  | "edit-message"
  | "delete-message"
  | "private-user";

export type FriendType = PartialProfile & {
  memberSince: string;
};

type PartialServer = Pick<Server, "_id" | "name" | "logo" | "inviteCode">;

export type SidebarProfileData = {
  type: "direct" | "group";

  friend?: FriendType;
  servers?: PartialServer[] | [];
  mutualServers?: PartialServer[] | [];
  mutualFriends?: PartialProfile[] | [];

  members?: PartialProfile[] | [];
  adminId?: string;
};

export interface ModalData {
  server?: Pick<
    Server,
    "_id" | "name" | "logo" | "inviteCode" | "profileId" | "members"
  >;
  channel?: Channel;
  category?: Category;
  categoryData?: {
    name: string;
    private: boolean;
  };
  member?: Member;
  user?: PartialProfile;
  friends?: PartialProfile[];
  friend?: PartialProfile;
  sidebarProfile?: SidebarProfileData;
  conversation?: {
    _id: string;
    name?: string;
    logo?: IFile;
    participants?: PartialProfile[];
    admin?: string;
    type?: string;
  };

  privateMessage?: {
    conversationId: string;
    participants: PartialProfile[] | [];
    content: string;
  };

  message?: IMessage;
}

export interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;
  open: (type: ModalType, data?: ModalData) => void;
  close: () => void;
}

export const useModal = create<ModalStore>()(
  devtools(set => ({
    type: null,
    isOpen: false,
    data: {},
    open: (type, data = {}) =>
      set({
        type,
        isOpen: true,
        data
      }),
    close: () =>
      set({
        type: null,
        isOpen: false,
        data: {}
      })
  }))
);
