import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/users - Search and explore students
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { q, skill, college, level, availability, limit = '24', offset = '0' } = req.query;

    const whereClause: any = {
      visibility: { not: 'PRIVATE' },
    };

    if (req.user) {
      whereClause.id = { not: req.user.id };
    }

    if (college) {
      whereClause.college = { contains: String(college) };
    }

    if (q) {
      whereClause.OR = [
        { name: { contains: String(q) } },
        { bio: { contains: String(q) } },
        { college: { contains: String(q) } },
        { department: { contains: String(q) } },
      ];
    }

    if (skill) {
      whereClause.skills = {
        some: {
          skill: { name: { contains: String(skill) } },
          type: 'TEACH',
        },
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        college: true,
        department: true,
        year: true,
        bio: true,
        languages: true,
        availability: true,
        learningHours: true,
        teachingHours: true,
        skills: {
          include: { skill: { include: { category: true } } },
        },
        reviewsReceived: {
          select: { rating: true, teachingClarity: true },
        },
        _count: {
          select: { reviewsReceived: true, hostedSessions: true, joinedSessions: true },
        },
      },
      take: parseInt(String(limit), 10),
      skip: parseInt(String(offset), 10),
    });

    const formatted = students.map((s) => {
      const avgRating =
        s.reviewsReceived.length > 0
          ? Number(
              (
                s.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
                s.reviewsReceived.length
              ).toFixed(1)
            )
          : 5.0;

      return {
        ...s,
        ratingAverage: avgRating,
        reviewCount: s._count.reviewsReceived,
        totalSessions: s._count.hostedSessions + s._count.joinedSessions,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Failed to list students:', error);
    res.status(500).json({ error: 'Failed to explore students' });
  }
});

// GET /api/users/me/dashboard - Student progress dashboard
router.get('/me/dashboard', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: { skill: true },
        },
        achievements: {
          include: { achievement: true },
        },
        learningGoals: true,
        roadmaps: {
          include: { items: true },
          take: 3,
        },
        reviewsReceived: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const upcomingSessions = await prisma.session.findMany({
      where: {
        OR: [{ hostId: userId }, { participantId: userId }],
        status: { in: ['SCHEDULED', 'STARTING_SOON', 'LIVE'] },
      },
      include: {
        skill: true,
        host: { select: { id: true, name: true, avatarUrl: true } },
        participant: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { scheduledStartTime: 'asc' },
      take: 5,
    });

    const pendingRequestsCount = await prisma.skillSwapRequest.count({
      where: { receiverId: userId, status: 'PENDING' },
    });

    const questionsCount = await prisma.question.count({
      where: { authorId: userId },
    });

    const answersCount = await prisma.answer.count({
      where: { authorId: userId },
    });

    const completedSessionsCount = await prisma.session.count({
      where: {
        OR: [{ hostId: userId }, { participantId: userId }],
        status: 'COMPLETED',
      },
    });

    const avgRating =
      user.reviewsReceived.length > 0
        ? Number(
            (
              user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
              user.reviewsReceived.length
            ).toFixed(1)
          )
        : 5.0;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        college: user.college,
        avatarUrl: user.avatarUrl,
        learningHours: user.learningHours,
        teachingHours: user.teachingHours,
        ratingAverage: avgRating,
        reviewCount: user.reviewsReceived.length,
      },
      skillsTeaching: user.skills.filter((s) => s.type === 'TEACH'),
      skillsLearning: user.skills.filter((s) => s.type === 'LEARN'),
      upcomingSessions,
      completedSessionsCount,
      pendingRequestsCount,
      questionsCount,
      answersCount,
      roadmaps: user.roadmaps,
      achievements: user.achievements.map((a) => a.achievement),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load student dashboard' });
  }
});

// GET /api/users/:id - Public student profile
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        skills: {
          include: { skill: { include: { category: true } } },
        },
        learningGoals: true,
        achievements: {
          include: { achievement: true },
        },
        reviewsReceived: {
          include: {
            reviewer: { select: { id: true, name: true, avatarUrl: true, college: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { hostedSessions: true, joinedSessions: true, answers: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const { passwordHash, ...safeUser } = user;
    const avgRating =
      user.reviewsReceived && user.reviewsReceived.length > 0
        ? Number(
            (
              user.reviewsReceived.reduce((acc: number, r: any) => acc + r.rating, 0) /
              user.reviewsReceived.length
            ).toFixed(1)
          )
        : 5.0;

    res.json({
      ...safeUser,
      ratingAverage: avgRating,
      reviewCount: user.reviewsReceived ? user.reviewsReceived.length : 0,
      completedSessions: user._count ? user._count.hostedSessions + user._count.joinedSessions : 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

// PATCH /api/users/me - Update profile
router.patch('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      name,
      college,
      department,
      year,
      bio,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      visibility,
      availability,
      languages,
      avatarUrl,
    } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(college !== undefined && { college }),
        ...(department !== undefined && { department }),
        ...(year !== undefined && { year }),
        ...(bio !== undefined && { bio }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(visibility !== undefined && { visibility }),
        ...(availability !== undefined && { availability }),
        ...(languages !== undefined && { languages }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    const { passwordHash, ...safe } = updated;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student profile' });
  }
});

// POST /api/users/me/skills - Add or update skill
router.post('/me/skills', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { skillId, type, level = 'INTERMEDIATE', description, yearsOfExperience } = req.body;

    if (!skillId || !type) {
      res.status(400).json({ error: 'skillId and type (TEACH/LEARN) are required.' });
      return;
    }

    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId_type: {
          userId,
          skillId,
          type,
        },
      },
      update: {
        level,
        description,
        yearsOfExperience: yearsOfExperience ? parseFloat(yearsOfExperience) : 1.0,
      },
      create: {
        userId,
        skillId,
        type,
        level,
        description,
        yearsOfExperience: yearsOfExperience ? parseFloat(yearsOfExperience) : 1.0,
      },
      include: {
        skill: true,
      },
    });

    res.json(userSkill);
  } catch (error) {
    console.error('Failed to add skill:', error);
    res.status(500).json({ error: 'Failed to save skill to profile' });
  }
});

// DELETE /api/users/me/skills/:id - Delete a user skill
router.delete('/me/skills/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const skillId = req.params.id as string;
    await prisma.userSkill.deleteMany({
      where: { id: skillId, userId },
    });
    res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove skill' });
  }
});

export default router;
