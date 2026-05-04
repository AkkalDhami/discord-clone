import { create } from "zustand";
import { io, Socket } from "socket.io-client";

type SocketState = {
  socket: Socket | null;
  connect: (userId: string) => void;
  disconnect: () => void;
};

export const useSocket = create<SocketState>((set, get) => ({
  socket: null,

  connect: userId => {
    if (get().socket) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      query: { userId },
      withCredentials: true,
      autoConnect: false
    });

    set({ socket });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });
  }
}));
