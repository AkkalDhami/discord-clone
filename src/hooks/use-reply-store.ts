import { ReplyMessage } from "@/interface";
import { create } from "zustand";

type ReplyMessageWithVisibleTo = ReplyMessage & { visibleTo: string[] };

type ReplyState = {
  replyingTo: ReplyMessageWithVisibleTo | null;

  setReplyingTo: (message: ReplyMessageWithVisibleTo) => void;
  clearReply: () => void;
};

export const useReply = create<ReplyState>(set => ({
  replyingTo: null,

  setReplyingTo: message => set({ replyingTo: message }),

  clearReply: () => set({ replyingTo: null })
}));
