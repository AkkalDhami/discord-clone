import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initSocket = (): Socket => {
  const URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

  if (!socket) {
    socket = io(URL, { autoConnect: false });
  }

  return socket;
};
