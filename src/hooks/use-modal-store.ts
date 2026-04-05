import { Server } from "@/interface";
import { create } from "zustand";

export type ModalType =
  | "create-server"
  | "edit-server"
  | "leave-server"
  | "delete-server"
  | "invite-people"
  | "members"
  | "create-channel"
  | "edit-channel"
  | "create-category"
  | "delete-category"
  | "edit-category";

interface ModalData {
  server?: Pick<
    Server,
    "_id" | "name" | "logo" | "inviteCode" | "profileId" | "members"
  >;
}

interface ModalStore {
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
