import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai/aiChatService';

const router = Router();

// GET /api/questions - List questions
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, tag, q, sort = 'latest', limit = '20', offset = '0' } = req.query;

    const where: any = {};
    if (category) {
      where.category = { slug: String(category) };
    }
    if (tag) {
      where.tags = { contains: String(tag) };
    }
    if (q) {
      where.OR = [
        { title: { contains: String(q) } },
        { content: { contains: String(q) } },
        { tags: { contains: String(q) } },
      ];
    }

    const orderBy: any = {};
    if (sort === 'top') {
      orderBy.voteCount = 'desc';
    } else if (sort === 'unanswered') {
      where.answerCount = 0;
      orderBy.createdAt = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, college: true } },
        category: true,
        answers: {
          take: 1,
          orderBy: { voteCount: 'desc' },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
      orderBy,
      take: parseInt(String(limit), 10),
      skip: parseInt(String(offset), 10),
    });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// GET /api/questions/:id - Get question detail with answers
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    // Increment views
    await prisma.question.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, college: true, department: true } },
        category: true,
        answers: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true, college: true } },
          },
          orderBy: [{ isAccepted: 'desc' }, { voteCount: 'desc' }],
        },
        bookmarks: userId ? { where: { userId } } : false,
        votes: userId ? { where: { userId } } : false,
      },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({
      ...question,
      isBookmarked: Boolean(question.bookmarks && question.bookmarks.length > 0),
      userVote: question.votes && question.votes.length > 0 ? question.votes[0].value : 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// POST /api/questions - Ask a question
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const { title, content, categoryId, tags = '' } = req.body;

    if (!title || !content || !categoryId) {
      res.status(400).json({ error: 'Title, content, and category are required.' });
      return;
    }

    // Call AI to generate an initial concept breakdown hint
    let aiAnswer: string | null = null;
    try {
      const ai = aiService.getProvider();
      const explanation = await ai.explainConcept(title, content);
      aiAnswer = `${explanation.explanation}\n\n**Helpful Guidance Tips:**\n${explanation.hints.join('\n')}`;
    } catch {
      aiAnswer = null;
    }

    const question = await prisma.question.create({
      data: {
        title,
        content,
        authorId,
        categoryId,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
        aiAssistanceAnswer: aiAnswer,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: true,
      },
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// POST /api/questions/:id/answers - Submit an answer
router.post('/:id/answers', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const questionId = req.params.id as string;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Answer content cannot be empty.' });
      return;
    }

    const answer = await prisma.answer.create({
      data: {
        questionId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, college: true } },
      },
    });

    await prisma.question.update({
      where: { id: questionId },
      data: { answerCount: { increment: 1 } },
    });

    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post answer' });
  }
});

// POST /api/questions/:id/vote - Vote on question
router.post('/:id/vote', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { value } = req.body; // 1 or -1

    const voteVal = value > 0 ? 1 : -1;

    const existing = await prisma.vote.findUnique({
      where: { userId_questionId: { userId, questionId: id } },
    });

    if (existing) {
      if (existing.value === voteVal) {
        // Toggle off
        await prisma.vote.delete({ where: { id: existing.id } });
        await prisma.question.update({
          where: { id },
          data: { voteCount: { decrement: voteVal } },
        });
        res.json({ userVote: 0 });
        return;
      } else {
        // Change vote
        await prisma.vote.update({
          where: { id: existing.id },
          data: { value: voteVal },
        });
        await prisma.question.update({
          where: { id },
          data: { voteCount: { increment: voteVal * 2 } },
        });
        res.json({ userVote: voteVal });
        return;
      }
    }

    await prisma.vote.create({
      data: { userId, questionId: id, value: voteVal },
    });
    await prisma.question.update({
      where: { id },
      data: { voteCount: { increment: voteVal } },
    });

    res.json({ userVote: voteVal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote' });
  }
});

// POST /api/questions/answers/:id/vote - Vote on answer
router.post('/answers/:id/vote', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { value } = req.body;

    const voteVal = value > 0 ? 1 : -1;

    const existing = await prisma.vote.findUnique({
      where: { userId_answerId: { userId, answerId: id } },
    });

    if (existing) {
      if (existing.value === voteVal) {
        await prisma.vote.delete({ where: { id: existing.id } });
        const updated = await prisma.answer.update({
          where: { id },
          data: { voteCount: { decrement: voteVal } },
        });
        res.json({ voteCount: updated.voteCount, userVote: 0 });
        return;
      } else {
        await prisma.vote.update({
          where: { id: existing.id },
          data: { value: voteVal },
        });
        const updated = await prisma.answer.update({
          where: { id },
          data: { voteCount: { increment: voteVal * 2 } },
        });
        res.json({ voteCount: updated.voteCount, userVote: voteVal });
        return;
      }
    }

    await prisma.vote.create({
      data: { userId, answerId: id, value: voteVal },
    });
    const updated = await prisma.answer.update({
      where: { id },
      data: { voteCount: { increment: voteVal } },
    });

    // Award "Helpful Answer" achievement if voteCount reaches 5
    if (updated.voteCount >= 5) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'HELPFUL_ANSWER' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: updated.authorId, achievementId: ach.id } },
          update: {},
          create: { userId: updated.authorId, achievementId: ach.id },
        });
      }
    }

    res.json({ voteCount: updated.voteCount, userVote: voteVal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to vote on answer' });
  }
});

// POST /api/questions/:id/bookmark - Bookmark question
router.post('/:id/bookmark', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const existing = await prisma.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId: id } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      res.json({ isBookmarked: false });
    } else {
      await prisma.bookmark.create({ data: { userId, questionId: id } });
      res.json({ isBookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to bookmark question' });
  }
});

export default router;
