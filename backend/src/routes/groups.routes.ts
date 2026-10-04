import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/groups - List study groups
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { category, q } = req.query;

    const where: any = {};
    if (category) where.category = String(category);
    if (q) {
      where.OR = [
        { name: { contains: String(q) } },
        { description: { contains: String(q) } },
      ];
    }

    const groups = await prisma.studyGroup.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: userId ? { where: { userId } } : false,
      },
      orderBy: { memberCount: 'desc' },
    });

    const formatted = groups.map((g) => ({
      ...g,
      isMember: Boolean(g.members && g.members.length > 0),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study groups' });
  }
});

// POST /api/groups - Create study group
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user!.id;
    const { name, description, category = 'General', topics = '' } = req.body;

    if (!name || !description) {
      res.status(400).json({ error: 'Group name and description are required' });
      return;
    }

    const group = await prisma.studyGroup.create({
      data: {
        name,
        description,
        category,
        topics: Array.isArray(topics) ? topics.join(',') : topics,
        creatorId,
        memberCount: 1,
        members: {
          create: {
            userId: creatorId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// POST /api/groups/:id/join - Join group
router.post('/:id/join', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const groupId = req.params.id as string;

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing) {
      res.status(400).json({ error: 'Already a member of this group' });
      return;
    }

    await prisma.groupMember.create({
      data: { groupId, userId, role: 'MEMBER' },
    });

    const updated = await prisma.studyGroup.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });

    res.json({ message: 'Successfully joined group', memberCount: updated.memberCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// POST /api/groups/:id/leave - Leave group
router.post('/:id/leave', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const groupId = req.params.id as string;

    await prisma.groupMember.deleteMany({
      where: { groupId, userId },
    });

    const updated = await prisma.studyGroup.update({
      where: { id: groupId },
      data: { memberCount: { decrement: 1 } },
    });

    res.json({ message: 'Left study group', memberCount: updated.memberCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

export default router;
