import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/skills - List skills (with search, category filter, teacher count)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, q } = req.query;

    const where: any = {};
    if (category) {
      where.category = { slug: String(category) };
    }
    if (q) {
      where.name = { contains: String(q) };
    }

    const skills = await prisma.skill.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            userSkills: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/skills/categories - List all categories
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.skillCategory.findMany({
      include: {
        _count: { select: { skills: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/skills - Create custom skill
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, categoryId, description } = req.body;
    if (!name || !categoryId) {
      res.status(400).json({ error: 'Skill name and categoryId are required' });
      return;
    }

    const existing = await prisma.skill.findFirst({
      where: { name: { equals: name.trim() } },
    });

    if (existing) {
      res.status(409).json({ error: 'A skill with this name already exists', skill: existing });
      return;
    }

    const skill = await prisma.skill.create({
      data: {
        name: name.trim(),
        categoryId,
        description: description || 'Student created skill',
        isCustom: true,
        createdByUserId: req.user!.id,
      },
      include: { category: true },
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

export default router;
