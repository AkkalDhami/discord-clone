import { ReplyMessage } from "@/interface";
import { create } from "zustand";

type ReplyState = {
  replyingTo: ReplyMessage | null;

  setReplyingTo: (message: ReplyMessage) => void;
  clearReply: () => void;
};

export const useReply = create<ReplyState>(set => ({
  replyingTo: null,

  setReplyingTo: message => set({ replyingTo: message }),

  clearReply: () => set({ replyingTo: null })
}));
