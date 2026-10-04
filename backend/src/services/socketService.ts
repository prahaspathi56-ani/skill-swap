import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface SocketUser {
  userId: string;
  socketId: string;
}

export class SocketService {
  private io: Server | null = null;
  private onlineUsers: Map<string, string> = new Map(); // userId -> socketId
  private roomParticipants: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.frontendUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Optional auth middleware on socket connection
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (token && typeof token === 'string') {
        try {
          const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
          socket.data.userId = decoded.userId;
        } catch {
          // Token invalid, allow anonymous or reject depending on need
        }
      }
      next();
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId || (socket.handshake.query.userId as string);

      if (userId) {
        this.onlineUsers.set(userId, socket.id);
        this.io?.emit('user_online', { userId, status: 'ONLINE' });
      }

      // 1. One-on-one Chat Events
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conv_${conversationId}`);
      });

      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conv_${conversationId}`);
      });

      socket.on('send_message', (messageData: any) => {
        const { conversationId } = messageData;
        socket.to(`conv_${conversationId}`).emit('new_message', messageData);

        // Also notify receiver if outside room
        if (messageData.receiverId) {
          const receiverSocket = this.onlineUsers.get(messageData.receiverId);
          if (receiverSocket) {
            this.io?.to(receiverSocket).emit('notification', {
              type: 'NEW_MESSAGE',
              title: `New message from ${messageData.senderName || 'Student'}`,
              message: messageData.content,
              actionUrl: `/messages?id=${conversationId}`,
            });
          }
        }
      });

      socket.on('typing_start', ({ conversationId, userId: typerId, userName }) => {
        socket.to(`conv_${conversationId}`).emit('user_typing', { userId: typerId, userName, isTyping: true });
      });

      socket.on('typing_stop', ({ conversationId, userId: typerId }) => {
        socket.to(`conv_${conversationId}`).emit('user_typing', { userId: typerId, isTyping: false });
      });

      // 2. WebRTC Live Learning Session Signaling Events
      socket.on('join_session_room', ({ roomId, userId: participantId, userName }) => {
        socket.join(`session_${roomId}`);

        if (!this.roomParticipants.has(roomId)) {
          this.roomParticipants.set(roomId, new Set());
        }
        this.roomParticipants.get(roomId)?.add(participantId);

        // Notify existing members in room that a peer joined
        socket.to(`session_${roomId}`).emit('peer_joined', {
          peerId: participantId,
          socketId: socket.id,
          userName,
        });

        // Send back list of other participants currently in room
        const existingParticipants = Array.from(this.roomParticipants.get(roomId) || []).filter(
          (id) => id !== participantId
        );
        socket.emit('session_participants', { participants: existingParticipants });
      });

      socket.on('signal_offer', ({ targetSocketId, targetUserId, offer, senderId, senderName }) => {
        if (targetSocketId) {
          this.io?.to(targetSocketId).emit('signal_offer', { offer, senderId, senderName, senderSocketId: socket.id });
        } else if (targetUserId) {
          const sid = this.onlineUsers.get(targetUserId);
          if (sid) {
            this.io?.to(sid).emit('signal_offer', { offer, senderId, senderName, senderSocketId: socket.id });
          }
        }
      });

      socket.on('signal_answer', ({ targetSocketId, targetUserId, answer, senderId }) => {
        if (targetSocketId) {
          this.io?.to(targetSocketId).emit('signal_answer', { answer, senderId, senderSocketId: socket.id });
        } else if (targetUserId) {
          const sid = this.onlineUsers.get(targetUserId);
          if (sid) {
            this.io?.to(sid).emit('signal_answer', { answer, senderId, senderSocketId: socket.id });
          }
        }
      });

      socket.on('signal_ice_candidate', ({ targetSocketId, targetUserId, candidate, senderId }) => {
        if (targetSocketId) {
          this.io?.to(targetSocketId).emit('signal_ice_candidate', { candidate, senderId });
        } else if (targetUserId) {
          const sid = this.onlineUsers.get(targetUserId);
          if (sid) {
            this.io?.to(sid).emit('signal_ice_candidate', { candidate, senderId });
          }
        }
      });

      socket.on('raise_hand', ({ roomId, userId: actorId, userName, isRaised }) => {
        this.io?.to(`session_${roomId}`).emit('peer_hand_raised', { userId: actorId, userName, isRaised });
      });

      socket.on('toggle_media', ({ roomId, userId: actorId, type, enabled }) => {
        socket.to(`session_${roomId}`).emit('peer_media_toggled', { userId: actorId, type, enabled });
      });

      socket.on('update_session_notes', ({ roomId, notes, senderName }) => {
        socket.to(`session_${roomId}`).emit('session_notes_updated', { notes, senderName });
      });

      socket.on('session_chat_message', ({ roomId, message }) => {
        this.io?.to(`session_${roomId}`).emit('new_session_chat', message);
      });

      socket.on('leave_session_room', ({ roomId, userId: leaverId }) => {
        socket.leave(`session_${roomId}`);
        this.roomParticipants.get(roomId)?.delete(leaverId);
        socket.to(`session_${roomId}`).emit('peer_left', { peerId: leaverId, socketId: socket.id });
      });

      // Disconnect handling
      socket.on('disconnect', () => {
        if (userId) {
          this.onlineUsers.delete(userId);
          this.io?.emit('user_offline', { userId, status: 'OFFLINE' });
        }
      });
    });

    return this.io;
  }

  getIo(): Server | null {
    return this.io;
  }

  sendNotificationToUser(userId: string, notification: any): void {
    const socketId = this.onlineUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit('notification', notification);
    }
  }
}

export const socketService = new SocketService();
