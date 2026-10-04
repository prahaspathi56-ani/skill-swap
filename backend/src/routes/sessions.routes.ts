import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// GET /api/sessions - Get user's sessions
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    const where: any = {
      OR: [{ hostId: userId }, { participantId: userId }],
    };

    if (status) {
      where.status = String(status);
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        skill: true,
        host: { select: { id: true, name: true, email: true, college: true, avatarUrl: true } },
        participant: { select: { id: true, name: true, email: true, college: true, avatarUrl: true } },
        reviews: true,
      },
      orderBy: { scheduledStartTime: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id - Get session details
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const session = await prisma.session.findFirst({
      where: {
        OR: [{ id }, { meetingRoomId: id }],
      },
      include: {
        skill: true,
        host: { select: { id: true, name: true, email: true, college: true, avatarUrl: true } },
        participant: { select: { id: true, name: true, email: true, college: true, avatarUrl: true } },
        reviews: true,
      },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Verify participant
    if (session.hostId !== userId && session.participantId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'You are not a registered participant in this session' });
      return;
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/sessions - Schedule live learning session
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hostId = req.user!.id;
    const { participantId, skillId, title, scheduledStartTime, durationMinutes = 60, agenda } = req.body;

    if (!participantId || !skillId || !scheduledStartTime) {
      res.status(400).json({ error: 'Participant, skill, and start time are required.' });
      return;
    }

    const meetingRoomId = `swap-${crypto.randomBytes(4).toString('hex')}-${Date.now().toString(36)}`;

    const session = await prisma.session.create({
      data: {
        title: title || 'Peer Skill Exchange Session',
        hostId,
        participantId,
        skillId,
        scheduledStartTime: new Date(scheduledStartTime),
        durationMinutes: parseInt(String(durationMinutes), 10) || 60,
        meetingRoomId,
        agenda: agenda || 'Collaborative hands-on learning and mutual Q&A.',
        status: 'SCHEDULED',
      },
      include: {
        skill: true,
        host: { select: { id: true, name: true, avatarUrl: true } },
        participant: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Notify participant
    await prisma.notification.create({
      data: {
        userId: participantId,
        type: 'SESSION_REMINDER',
        title: `Live Session Scheduled: ${session.skill.name}`,
        message: `${req.user!.name} scheduled a ${durationMinutes}-min session on ${new Date(scheduledStartTime).toLocaleDateString()}.`,
        actionUrl: `/sessions`,
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Schedule session error:', error);
    res.status(500).json({ error: 'Failed to schedule session' });
  }
});

// PATCH /api/sessions/:id/status - Update session state (LIVE, COMPLETED, CANCELLED)
router.patch('/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { status } = req.body;

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.hostId !== userId && session.participantId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized to change session state' });
      return;
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' ? { endedAt: new Date() } : {}),
      },
    });

    // If completed, update student learning/teaching hours!
    if (status === 'COMPLETED') {
      const hours = session.durationMinutes / 60;
      await prisma.user.update({
        where: { id: session.hostId },
        data: { teachingHours: { increment: hours } },
      });
      await prisma.user.update({
        where: { id: session.participantId },
        data: { learningHours: { increment: hours } },
      });

      // Check for "First Skill Learned" / "10 Sessions" achievements
      const hostTotal = await prisma.session.count({
        where: { hostId: session.hostId, status: 'COMPLETED' },
      });
      if (hostTotal >= 10) {
        const ach = await prisma.achievement.findUnique({ where: { code: 'TEN_SESSIONS_COMPLETED' } });
        if (ach) {
          await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId: session.hostId, achievementId: ach.id } },
            update: {},
            create: { userId: session.hostId, achievementId: ach.id },
          });
        }
      }

      const learnAch = await prisma.achievement.findUnique({ where: { code: 'FIRST_SKILL_LEARNED' } });
      if (learnAch) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: session.participantId, achievementId: learnAch.id } },
          update: {},
          create: { userId: session.participantId, achievementId: learnAch.id },
        });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

// PATCH /api/sessions/:id/notes - Save shared notes
router.patch('/:id/notes', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { notes } = req.body;

    const session = await prisma.session.update({
      where: { id },
      data: { sessionNotes: notes },
    });

    res.json({ sessionNotes: session.sessionNotes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save session notes' });
  }
});

export default router;
