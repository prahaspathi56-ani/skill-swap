import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Apply auth + RBAC: MODERATOR or ADMIN
router.use(authenticate);
router.use(requireRole(['MODERATOR', 'ADMIN']));

// GET /api/admin/stats - Overview analytics
router.get('/stats', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalSkills,
      totalSessions,
      completedSessions,
      totalSwaps,
      totalQuestions,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.skill.count(),
      prisma.session.count(),
      prisma.session.count({ where: { status: 'COMPLETED' } }),
      prisma.skillSwapConnection.count(),
      prisma.question.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);

    res.json({
      totalUsers,
      totalSkills,
      totalSessions,
      completedSessions,
      totalSwaps,
      totalQuestions,
      pendingReports,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

// GET /api/admin/users - User management
router.get('/users', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q, role, limit = '50' } = req.query;

    const where: any = {};
    if (role) where.role = String(role);
    if (q) {
      where.OR = [
        { name: { contains: String(q) } },
        { email: { contains: String(q) } },
        { college: { contains: String(q) } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { skills: true, hostedSessions: true, joinedSessions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(limit), 10),
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!['STUDENT', 'MODERATOR', 'ADMIN'].includes(role)) {
      res.status(400).json({ error: 'Invalid role specified' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to change role' });
  }
});

// GET /api/admin/reports - Reports moderation queue
router.get('/reports', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /api/admin/reports/:id - Resolve or dismiss report
router.patch('/reports/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

export default router;
