import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/reviews - Submit review after completed session
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reviewerId = req.user!.id;
    const { sessionId, rating, teachingClarity, sessionQuality, comment } = req.body;

    if (!sessionId || !rating || !comment) {
      res.status(400).json({ error: 'Session ID, rating, and feedback comment are required.' });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.status !== 'COMPLETED') {
      res.status(400).json({ error: 'Reviews can only be submitted for completed sessions.' });
      return;
    }

    if (session.hostId !== reviewerId && session.participantId !== reviewerId) {
      res.status(403).json({ error: 'You were not a participant in this session.' });
      return;
    }

    // Determine reviewee
    const revieweeId = session.hostId === reviewerId ? session.participantId : session.hostId;

    if (reviewerId === revieweeId) {
      res.status(400).json({ error: 'Self-ratings are strictly prohibited.' });
      return;
    }

    // Check duplicate
    const existing = await prisma.review.findUnique({
      where: { sessionId_reviewerId: { sessionId, reviewerId } },
    });

    if (existing) {
      res.status(409).json({ error: 'You have already submitted a review for this session.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        sessionId,
        reviewerId,
        revieweeId,
        rating: Math.min(Math.max(parseInt(String(rating), 10), 1), 5),
        teachingClarity: Math.min(Math.max(parseInt(String(teachingClarity || rating), 10), 1), 5),
        sessionQuality: Math.min(Math.max(parseInt(String(sessionQuality || rating), 10), 1), 5),
        comment,
      },
      include: {
        reviewer: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // If 5 stars on teaching clarity, award KNOWLEDGE_SHARER
    if (review.teachingClarity === 5) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'KNOWLEDGE_SHARER' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: revieweeId, achievementId: ach.id } },
          update: {},
          create: { userId: revieweeId, achievementId: ach.id },
        });
      }
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
