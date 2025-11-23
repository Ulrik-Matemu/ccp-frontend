// src/hooks/useSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: { token },
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.error("socket connect_error", err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
}
