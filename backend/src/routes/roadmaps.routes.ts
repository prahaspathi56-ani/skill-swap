import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai/aiChatService';

const router = Router();

// GET /api/roadmaps - Get current student's roadmaps
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const roadmaps = await prisma.learningRoadmap.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

// POST /api/roadmaps/generate - AI generates roadmap
router.post('/generate', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { targetGoal } = req.body;
    if (!targetGoal) {
      res.status(400).json({ error: 'Target learning goal is required' });
      return;
    }

    const ai = aiService.getProvider();
    const generated = await ai.generateRoadmap(targetGoal);

    res.json(generated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate learning roadmap' });
  }
});

// POST /api/roadmaps - Save roadmap to student profile
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, targetRole, description, items } = req.body;

    if (!title || !items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Title and items are required' });
      return;
    }

    const roadmap = await prisma.learningRoadmap.create({
      data: {
        userId,
        title,
        targetRole: targetRole || title,
        description: description || 'Personal student learning roadmap',
        progressPercent: 0,
        items: {
          create: items.map((item: any, idx: number) => ({
            title: item.title,
            description: item.description,
            order: item.order || idx + 1,
            recommendedSkillName: item.recommendedSkillName,
            isCompleted: false,
          })),
        },
      },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save roadmap' });
  }
});

// PATCH /api/roadmaps/:id/items/:itemId - Toggle completion of roadmap item
router.patch('/:id/items/:itemId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const roadmapId = req.params.id as string;
    const itemId = req.params.itemId as string;
    const { isCompleted } = req.body;

    const roadmap = await prisma.learningRoadmap.findUnique({
      where: { id: roadmapId },
      include: { items: true },
    });

    if (!roadmap || roadmap.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    await prisma.roadmapItem.update({
      where: { id: itemId },
      data: { isCompleted },
    });

    // Recompute progress percentage
    const updatedItems = await prisma.roadmapItem.findMany({
      where: { roadmapId },
    });
    const completedCount = updatedItems.filter((i) => i.isCompleted).length;
    const progressPercent =
      updatedItems.length > 0 ? Number(((completedCount / updatedItems.length) * 100).toFixed(1)) : 0;

    const updatedRoadmap = await prisma.learningRoadmap.update({
      where: { id: roadmapId },
      data: { progressPercent },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    res.json(updatedRoadmap);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update roadmap item' });
  }
});

export default router;
