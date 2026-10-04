import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai/aiChatService';

const router = Router();

// POST /api/english/practice - AI conversation exchange with feedback
router.post('/practice', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { message, history = [], level = 'INTERMEDIATE' } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    const ai = aiService.getProvider();
    const result = await ai.practiceEnglish(message, history, level);

    // Track practice for achievement
    const ach = await prisma.achievement.findUnique({ where: { code: 'ENGLISH_PRACTICE_STREAK' } });
    if (ach) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: ach.id } },
        update: {},
        create: { userId, achievementId: ach.id },
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'English practice exchange failed' });
  }
});

// GET /api/english/prompts - Daily speaking and interview prompts
router.get('/prompts', optionalAuth, async (_req: Request, res: Response): Promise<void> => {
  const prompts = [
    {
      category: 'College & Academics',
      title: 'Describing Your Final Year Project',
      prompt: 'Imagine you are explaining your favorite technical project to a recruiter in 90 seconds. What problem did you solve and what was your primary contribution?',
      targetLevel: 'Intermediate',
    },
    {
      category: 'Behavioral & Leadership',
      title: 'Resolving a Team Conflict',
      prompt: 'Discuss a time when you and a teammate had conflicting opinions on a technical decision. How did you negotiate and reach consensus?',
      targetLevel: 'Advanced',
    },
    {
      category: 'First Principles',
      title: 'Explain Like I am Five',
      prompt: 'Choose one complex technical concept (e.g. recursion, indexing, caching) and explain it using a real-world everyday metaphor.',
      targetLevel: 'Beginner',
    },
  ];

  res.json(prompts);
});

export default router;
