import { create } from "zustand";
import { io, Socket } from "socket.io-client";

type SocketState = {
  socket: Socket | null;

  onlineUsers: string[];
  setOnlineUsers: (users: string[]) => void;

  connect: (userId: string) => void;
  disconnect: () => void;
};

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,

  onlineUsers: [],

  setOnlineUsers: users => {
    set({
      onlineUsers: users
    });
  },

  connect: userId => {
    const existing = get().socket;

    if (existing?.connected) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      query: { userId },
      withCredentials: true,
      autoConnect: false
    });

    socket.connect();

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;

    socket?.disconnect();

    set({ socket: null });
  }
}));
