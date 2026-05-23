"use client";

import { useEffect } from "react";

import { useSocket } from "@/hooks/use-socket-store";

export function SocketProvider({ userId }: { userId: string }) {
  const connect = useSocket(state => state.connect);
  const disconnect = useSocket(state => state.disconnect);

  const setOnlineUsers = useSocket(state => state.setOnlineUsers);

  const socket = useSocket(state => state.socket);

  useEffect(() => {
    connect(userId);

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    socket.on("users:online", handleOnlineUsers);

    return () => {
      socket.off("users:online", handleOnlineUsers);
    };
  }, [socket, setOnlineUsers]);

  return null;
}
