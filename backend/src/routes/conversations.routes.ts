import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { socketService } from '../services/socketService';

const router = Router();

// GET /api/conversations - List conversations for authenticated student
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Populate the other user info
    const formatted = await Promise.all(
      conversations.map(async (c) => {
        const otherUserId = c.user1Id === userId ? c.user2Id : c.user1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            college: true,
            skills: {
              include: { skill: true },
            },
          },
        });

        // Count unread
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: otherUserId,
            isRead: false,
          },
        });

        return {
          id: c.id,
          otherUser,
          lastMessage: c.messages[0] || null,
          unreadCount,
          updatedAt: c.updatedAt,
        };
      })
    );

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/conversations/start - Start or find conversation with another student
router.post('/start', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === userId) {
      res.status(400).json({ error: 'Valid target student ID required' });
      return;
    }

    const [u1, u2] = [userId, targetUserId].sort();

    let conv = await prisma.conversation.findUnique({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: { user1Id: u1, user2Id: u2 },
      });
    }

    res.json(conv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// GET /api/conversations/:id/messages - Get messages in conversation
router.get('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv || (conv.user1Id !== userId && conv.user2Id !== userId)) {
      res.status(403).json({ error: 'Unauthorized to view this conversation' });
      return;
    }

    // Mark as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        session: { include: { skill: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/conversations/:id/messages - Send message
router.post('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const id = req.params.id as string;
    const { content, attachmentUrl, attachmentType, sessionId } = req.body;

    if (!content && !attachmentUrl && !sessionId) {
      res.status(400).json({ error: 'Message content or attachment is required.' });
      return;
    }

    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv || (conv.user1Id !== senderId && conv.user2Id !== senderId)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId,
        content: content || (sessionId ? 'Shared live learning session invitation' : ''),
        attachmentUrl,
        attachmentType,
        sessionId,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        session: { include: { skill: true } },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    const receiverId = conv.user1Id === senderId ? conv.user2Id : conv.user1Id;

    // Send real-time socket events
    const io = socketService.getIo();
    if (io) {
      io.to(`conv_${id}`).emit('new_message', message);
    }

    socketService.sendNotificationToUser(receiverId, {
      type: 'NEW_MESSAGE',
      title: `Message from ${req.user!.name}`,
      message: message.content.slice(0, 80),
      actionUrl: `/messages?id=${id}`,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
