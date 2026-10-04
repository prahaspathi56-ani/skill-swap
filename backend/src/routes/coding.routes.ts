import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { codingSandboxService } from '../services/codingSandboxService';

const router = Router();

// GET /api/coding/problems - List coding problems
router.get('/problems', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { difficulty, category } = req.query;

    const where: any = {};
    if (difficulty) where.difficulty = String(difficulty);
    if (category) where.category = String(category);

    const problems = await prisma.codingProblem.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        description: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { title: 'asc' },
    });

    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coding problems' });
  }
});

// GET /api/coding/problems/:slug - Get single problem
router.get('/problems/:slug', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    const problem = await prisma.codingProblem.findUnique({
      where: { slug },
    });

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json({
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      category: problem.category,
      description: problem.description,
      starterCode: JSON.parse(problem.starterCode || '{}'),
      testCases: JSON.parse(problem.testCases || '[]').filter((tc: any) => !tc.isSecret),
      hints: JSON.parse(problem.hints || '[]'),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load problem' });
  }
});

// POST /api/coding/problems/:slug/submit - Safely evaluate submission
router.post('/problems/:slug/submit', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const slug = req.params.slug as string;
    const { language, code } = req.body;

    if (!language || !code) {
      res.status(400).json({ error: 'Language and code are required' });
      return;
    }

    const problem = await prisma.codingProblem.findUnique({
      where: { slug },
    });

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    const allTestCases = JSON.parse(problem.testCases || '[]');

    const result = await codingSandboxService.evaluateSubmission(language, code, allTestCases);

    // Record submission
    const submission = await prisma.codingSubmission.create({
      data: {
        problemId: problem.id,
        userId,
        language,
        code,
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        executionTimeMs: result.executionTimeMs,
      },
    });

    // Check achievement unlock if accepted
    if (result.status === 'ACCEPTED') {
      const acceptedCount = await prisma.codingSubmission.count({
        where: { userId, status: 'ACCEPTED' },
      });

      if (acceptedCount >= 3) {
        const ach = await prisma.achievement.findUnique({ where: { code: 'CODING_CHAMPION' } });
        if (ach) {
          await prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: ach.id } },
            update: {},
            create: { userId, achievementId: ach.id },
          });
        }
      }
    }

    res.json({
      submissionId: submission.id,
      status: result.status,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      executionTimeMs: result.executionTimeMs,
      outputLog: result.outputLog,
      details: result.details,
    });
  } catch (error) {
    console.error('Coding submission error:', error);
    res.status(500).json({ error: 'Code execution failed.' });
  }
});

export default router;
