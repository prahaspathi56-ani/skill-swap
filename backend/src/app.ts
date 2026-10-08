import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import skillsRoutes from './routes/skills.routes';
import matchesRoutes from './routes/matches.routes';
import swapsRoutes from './routes/swaps.routes';
import conversationsRoutes from './routes/conversations.routes';
import sessionsRoutes from './routes/sessions.routes';
import questionsRoutes from './routes/questions.routes';
import communityRoutes from './routes/community.routes';
import groupsRoutes from './routes/groups.routes';
import roadmapsRoutes from './routes/roadmaps.routes';
import codingRoutes from './routes/coding.routes';
import englishRoutes from './routes/english.routes';
import reviewsRoutes from './routes/reviews.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';

export const createApp = (): Application => {
  const app = express();

  // Basic security & parsing
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General rate limiter
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'SkillSwap API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/matches', matchesRoutes);
  app.use('/api/swaps', swapsRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/sessions', sessionsRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/groups', groupsRoutes);
  app.use('/api/roadmaps', roadmapsRoutes);
  app.use('/api/coding', codingRoutes);
  app.use('/api/english', englishRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/ai', aiRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
