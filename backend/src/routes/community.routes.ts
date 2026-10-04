import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { authenticate, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/community/posts - List posts
router.get('/posts', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { category, q, limit = '20', offset = '0' } = req.query;
    const userId = req.user?.id;

    const where: any = {};
    if (category && category !== 'All') {
      where.category = String(category);
    }
    if (q) {
      where.OR = [
        { title: { contains: String(q) } },
        { content: { contains: String(q) } },
      ];
    }

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, college: true } },
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        },
        likes: userId ? { where: { userId } } : false,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(String(limit), 10),
      skip: parseInt(String(offset), 10),
    });

    const formatted = posts.map((p) => ({
      ...p,
      isLiked: Boolean(p.likes && p.likes.length > 0),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
});

// POST /api/community/posts - Create post
router.post('/posts', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const { title, content, category = 'General', tags = '' } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const post = await prisma.communityPost.create({
      data: {
        authorId,
        title,
        content,
        category,
        tags: Array.isArray(tags) ? tags.join(',') : tags,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true, college: true } },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/community/posts/:id/comments - Comment on post
router.post('/posts/:id/comments', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user!.id;
    const postId = req.params.id as string;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Comment content cannot be empty' });
      return;
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    await prisma.communityPost.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// POST /api/community/posts/:id/like - Like or unlike post
router.post('/posts/:id/like', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const postId = req.params.id as string;

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      const updated = await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
      });
      res.json({ isLiked: false, likesCount: updated.likesCount });
    } else {
      await prisma.postLike.create({
        data: { postId, userId },
      });
      const updated = await prisma.communityPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      });
      res.json({ isLiked: true, likesCount: updated.likesCount });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

export default router;
