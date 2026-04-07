import { Category, Channel, Member, Server } from "@/interface";
import { create } from "zustand";

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
  | "edit-category";

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
}

export interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  data: ModalData;
  open: (type: ModalType, data?: ModalData) => void;
  close: () => void;
}

export const useModal = create<ModalStore>(set => ({
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
      isOpen: false
    })
}));
