import { IServer } from "@/models/server.model";
import { create } from "zustand";

export type ModalType = "create-server" | "invite-people";

interface ModalData {
  server?: Pick<IServer, "_id" | "name" | "logo" | "inviteCode" | "profileId">;
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
