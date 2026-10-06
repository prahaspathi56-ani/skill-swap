import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { jwtService } from '../services/jwtService';

export interface AuthUser {
  id: string;
  email: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User no longer exists.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'STUDENT' | 'MODERATOR' | 'ADMIN',
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwtService.verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, name: true },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role as 'STUDENT' | 'MODERATOR' | 'ADMIN',
          name: user.name,
        };
      }
    }
  } catch {
    // proceed without authenticated user
  }
  next();
};

export const requireRole = (roles: Array<'STUDENT' | 'MODERATOR' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of roles: ${roles.join(', ')}.`,
      });
      return;
    }

    next();
  };
};
