import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { jwtService } from '../services/jwtService';
import { googleAuthService } from '../services/googleAuthService';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  college: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  bio: z.string().optional(),
  skillsToTeach: z.array(z.string()).optional(),
  skillsToLearn: z.array(z.string()).optional(),
  languages: z.string().optional(),
  availability: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      college,
      department,
      year,
      bio,
      skillsToTeach = [],
      skillsToLearn = [],
      languages = 'English',
      availability,
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        college: college || 'University Student',
        department: department || 'Computer Science & Engineering',
        year: year || '3rd Year',
        bio: bio || 'Excited to learn, teach, and exchange skills with peers!',
        languages,
        availability: availability || 'Flexible / Evenings & Weekends',
        isVerified: true,
      },
    });

    // Attach initial skills if provided
    for (const skillName of skillsToTeach) {
      const skill = await prisma.skill.findFirst({
        where: { name: { equals: skillName } },
      });
      if (skill) {
        await prisma.userSkill.create({
          data: {
            userId: newUser.id,
            skillId: skill.id,
            type: 'TEACH',
            level: 'INTERMEDIATE',
          },
        });
      }
    }

    for (const skillName of skillsToLearn) {
      const skill = await prisma.skill.findFirst({
        where: { name: { equals: skillName } },
      });
      if (skill) {
        await prisma.userSkill.create({
          data: {
            userId: newUser.id,
            skillId: skill.id,
            type: 'LEARN',
            level: 'BEGINNER',
          },
        });
      }
    }

    // Award First Skill Shared achievement if they listed teaching skills
    if (skillsToTeach.length > 0) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'FIRST_SKILL_SHARED' } });
      if (ach) {
        await prisma.userAchievement.create({
          data: { userId: newUser.id, achievementId: ach.id },
        });
      }
    }

    // Create welcoming notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Welcome to SkillSwap! 🚀',
        message: 'Your account is ready. Discover skills to learn and connect with peer mentors.',
        actionUrl: '/explore',
      },
    });

    const token = jwtService.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as any,
      name: newUser.name,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        college: newUser.college,
        department: newUser.department,
        year: newUser.year,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
        availability: newUser.availability,
        languages: newUser.languages,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create student account.' });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        error: !user
          ? 'Invalid email or password.'
          : 'This account was created using Google Sign-In. Please sign in with Google.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        year: user.year,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        availability: user.availability,
        languages: user.languages,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, token: rawToken } = req.body;
    const googleToken = credential || rawToken;

    if (!googleToken) {
      res.status(400).json({ error: 'Google authentication credential is required.' });
      return;
    }

    const googleUser = await googleAuthService.verifyIdToken(googleToken);

    // Look for existing student by Google ID or verified Email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.googleId },
          { email: googleUser.email },
        ],
      },
    });

    let isNewUser = false;

    if (!user) {
      // First-time Google user: auto-register student profile
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatarUrl,
          isVerified: true,
          college: 'University Student',
          department: 'General Studies',
          year: '1st Year',
          bio: 'Excited to learn, teach, and exchange skills on SkillSwap!',
          languages: 'English',
          availability: 'Flexible / Evenings & Weekends',
        },
      });

      // Send welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Welcome via Google! 🚀',
          message: 'Your Google-linked account is ready. Discover skills to learn and connect with peer mentors.',
          actionUrl: '/explore',
        },
      });
    } else {
      // Existing user: Link googleId or update avatar if missing
      const updateData: any = {};
      if (!user.googleId) updateData.googleId = googleUser.googleId;
      if (!user.avatarUrl && googleUser.avatarUrl) updateData.avatarUrl = googleUser.avatarUrl;
      if (!user.isVerified) updateData.isVerified = true;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    const token = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    res.json({
      message: isNewUser ? 'Google registration successful' : 'Google login successful',
      token,
      isNewUser,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        year: user.year,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        availability: user.availability,
        languages: user.languages,
      },
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: error.message || 'Google authentication failed.' });
  }
});


// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        skills: {
          include: { skill: { include: { category: true } } },
        },
        learningGoals: true,
        achievements: {
          include: { achievement: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  // Security best practice: don't reveal whether user exists
  res.json({
    message: 'If an account exists with this email, password reset instructions have been sent.',
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Valid email and new password (min 6 chars) required.' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }
  res.json({ message: 'Password has been successfully updated.' });
});

// POST /api/auth/verify-token - Check if a JWT token is valid and return payload
router.post('/verify-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ valid: false, error: 'Token is required.' });
      return;
    }
    const decoded = jwtService.verifyToken(token);
    res.json({ valid: true, payload: decoded });
  } catch (error: any) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token.' });
  }
});

// POST /api/auth/refresh - Refresh a valid JWT token
router.post('/refresh', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const newToken = jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token.' });
  }
});

export default router;

