// client/src/services/socket.js
import { io } from "socket.io-client";

export const createSocket = (token) => {
  if (!token) return null;

  return io("http://localhost:8080", {
    transports: ["websocket"],
    auth: {
      token: `Bearer ${token}`,
    },
  });
};