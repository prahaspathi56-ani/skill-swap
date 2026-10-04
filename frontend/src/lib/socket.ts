import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('token') || '';
    const socketBase = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || window.location.origin;
    socket = io(socketBase, {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected with ID:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
    });
  }

  return socket;
};

export const resetSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
