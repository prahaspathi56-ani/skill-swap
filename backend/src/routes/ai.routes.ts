import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai/aiChatService';

const router = Router();

// POST /api/ai/doubt - Concept explanation, hint generation, practice question
router.post('/doubt', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { concept, question, level = 'INTERMEDIATE' } = req.body;

    if (!concept && !question) {
      res.status(400).json({ error: 'Concept or question is required' });
      return;
    }

    const ai = aiService.getProvider();
    const explanation = await ai.explainConcept(concept || question, question, level);

    // Look up students teaching this skill or related skills for the "Ask a Human Student" feature!
    let matchingHumanMentors: any[] = [];
    if (concept) {
      const relatedSkill = await prisma.skill.findFirst({
        where: { name: { contains: concept.trim() } },
        include: {
          userSkills: {
            where: { type: 'TEACH' },
            include: {
              user: {
                select: { id: true, name: true, college: true, avatarUrl: true, availability: true },
              },
            },
            take: 3,
          },
        },
      });

      if (relatedSkill) {
        matchingHumanMentors = relatedSkill.userSkills.map((us) => us.user);
      }
    }

    res.json({
      ...explanation,
      matchingHumanMentors,
    });
  } catch (error) {
    res.status(500).json({ error: 'AI doubt assistant failed' });
  }
});

// POST /api/ai/recommend-skills - Personalized skill recommendations
router.post('/recommend-skills', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
        learningGoals: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const skillsLearning = user.skills.filter((s) => s.type === 'LEARN').map((s) => s.skill.name);
    const skillsTeaching = user.skills.filter((s) => s.type === 'TEACH').map((s) => s.skill.name);
    const goals = user.learningGoals.map((g) => g.title);

    const ai = aiService.getProvider();
    const recommendations = await ai.recommendSkills(skillsLearning, skillsTeaching, goals);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
