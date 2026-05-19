import { create } from "zustand";

export type TypingUser = {
  userId: string;
  username: string;
  conversationId: string;
};

type TypingStore = {
  typingUsers: Record<string, TypingUser[]>;

  addTypingUser: (conversationId: string, user: TypingUser) => void;

  removeTypingUser: (conversationId: string, userId: string) => void;
};

export const useTyping = create<TypingStore>(set => ({
  typingUsers: {},

  addTypingUser: (conversationId, user) =>
    set(state => {
      const users = state.typingUsers[conversationId] || [];

      const exists = users.some(u => u.userId === user.userId);

      if (exists) return state;

      return {
        typingUsers: {
          ...state.typingUsers,

          [conversationId]: [...users, user]
        }
      };
    }),

  removeTypingUser: (conversationId, userId) =>
    set(state => ({
      typingUsers: {
        ...state.typingUsers,

        [conversationId]: (state.typingUsers[conversationId] || []).filter(
          user => user.userId !== userId
        )
      }
    }))
}));
