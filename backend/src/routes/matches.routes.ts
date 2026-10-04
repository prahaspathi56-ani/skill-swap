import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { matchingService } from '../services/matchingService';

const router = Router();

// GET /api/matches - Retrieve reciprocal matches for current student
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const matches = await matchingService.findMatchesForUser(userId);
    res.json(matches);
  } catch (error) {
    console.error('Failed to get matches:', error);
    res.status(500).json({ error: 'Failed to compute student skill matches' });
  }
});

export default router;
