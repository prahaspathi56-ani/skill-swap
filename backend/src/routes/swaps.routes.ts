import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { socketService } from '../services/socketService';

const router = Router();

// GET /api/swaps/requests - Get incoming & outgoing swap requests
router.get('/requests', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [received, sent] = await Promise.all([
      prisma.skillSwapRequest.findMany({
        where: { receiverId: userId },
        include: {
          sender: {
            select: { id: true, name: true, email: true, college: true, avatarUrl: true },
          },
          offeredSkill: true,
          requestedSkill: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.skillSwapRequest.findMany({
        where: { senderId: userId },
        include: {
          receiver: {
            select: { id: true, name: true, email: true, college: true, avatarUrl: true },
          },
          offeredSkill: true,
          requestedSkill: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({ received, sent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
});

// POST /api/swaps/requests - Create new skill swap request
router.post('/requests', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { receiverId, offeredSkillId, requestedSkillId, message, preferredTime, durationMinutes = 60 } =
      req.body;

    if (!receiverId || !offeredSkillId || !requestedSkillId || !message || !preferredTime) {
      res.status(400).json({ error: 'All fields are required to request a skill swap.' });
      return;
    }

    if (senderId === receiverId) {
      res.status(400).json({ error: 'You cannot request a skill swap with yourself.' });
      return;
    }

    const swapRequest = await prisma.skillSwapRequest.create({
      data: {
        senderId,
        receiverId,
        offeredSkillId,
        requestedSkillId,
        message,
        preferredTime,
        durationMinutes: parseInt(String(durationMinutes), 10) || 60,
        status: 'PENDING',
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, college: true } },
        offeredSkill: true,
        requestedSkill: true,
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'SWAP_REQUEST',
        title: `Skill Swap Request from ${req.user!.name}`,
        message: `${req.user!.name} wants to learn ${swapRequest.requestedSkill.name} and offers to teach ${swapRequest.offeredSkill.name}.`,
        actionUrl: '/messages',
      },
    });

    socketService.sendNotificationToUser(receiverId, {
      type: 'SWAP_REQUEST',
      title: `Skill Swap Request from ${req.user!.name}`,
      message: `${req.user!.name} offered ${swapRequest.offeredSkill.name} in exchange for ${swapRequest.requestedSkill.name}.`,
      actionUrl: '/messages',
    });

    res.status(201).json(swapRequest);
  } catch (error) {
    console.error('Swap request error:', error);
    res.status(500).json({ error: 'Failed to send swap request' });
  }
});

// PATCH /api/swaps/requests/:id - Accept, decline, or counter-propose
router.patch('/requests/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { status, counterProposedTime } = req.body;

    const request = await prisma.skillSwapRequest.findUnique({
      where: { id },
      include: { offeredSkill: true, requestedSkill: true },
    });

    if (!request) {
      res.status(404).json({ error: 'Swap request not found' });
      return;
    }

    if (request.receiverId !== userId && request.senderId !== userId) {
      res.status(403).json({ error: 'Unauthorized to respond to this request' });
      return;
    }

    const updated = await prisma.skillSwapRequest.update({
      where: { id },
      data: {
        status,
        ...(counterProposedTime && { counterProposedTime }),
      },
    });

    if (status === 'ACCEPTED') {
      // Create connection
      const [u1, u2] = [request.senderId, request.receiverId].sort();
      await prisma.skillSwapConnection.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        update: { status: 'ACTIVE' },
        create: { user1Id: u1, user2Id: u2, status: 'ACTIVE' },
      });

      // Ensure conversation exists
      let conv = await prisma.conversation.findUnique({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: { user1Id: u1, user2Id: u2 },
        });
      }

      // Add system message
      await prisma.message.create({
        data: {
          conversationId: conv.id,
          senderId: userId,
          content: `🎉 Skill Swap accepted! We can now exchange ${request.offeredSkill.name} and ${request.requestedSkill.name}. Let's schedule our first session!`,
        },
      });

      // Award "First Swap Completed" check
      const swapAch = await prisma.achievement.findUnique({
        where: { code: 'FIRST_SWAP_COMPLETED' },
      });
      if (swapAch) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: request.senderId, achievementId: swapAch.id } },
          update: {},
          create: { userId: request.senderId, achievementId: swapAch.id },
        });
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: request.receiverId, achievementId: swapAch.id } },
          update: {},
          create: { userId: request.receiverId, achievementId: swapAch.id },
        });
      }

      // Notify the requester
      await prisma.notification.create({
        data: {
          userId: request.senderId,
          type: 'SWAP_ACCEPTED',
          title: `Swap Accepted! 🎉`,
          message: `Your skill swap with ${req.user!.name} has been accepted. Say hi in chat!`,
          actionUrl: `/messages?id=${conv.id}`,
        },
      });

      socketService.sendNotificationToUser(request.senderId, {
        type: 'SWAP_ACCEPTED',
        title: `Swap Accepted! 🎉`,
        message: `Your skill swap with ${req.user!.name} has been accepted.`,
        actionUrl: `/messages?id=${conv.id}`,
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Update swap request error:', error);
    res.status(500).json({ error: 'Failed to update swap request' });
  }
});

export default router;
