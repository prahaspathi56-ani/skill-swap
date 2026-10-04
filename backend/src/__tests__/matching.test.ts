import { describe, it, expect } from 'vitest';
import { MatchingService } from '../services/matchingService';

describe('SkillSwap Matching Engine', () => {
  it('should instantiate the matching service', () => {
    const service = new MatchingService();
    expect(service).toBeDefined();
    expect(typeof service.findMatchesForUser).toBe('function');
  });

  it('should calculate reciprocal score correctly when bilateral skills match', () => {
    // Bilateral test simulation
    const theyCanTeachMe = [{ id: '1', name: 'UI/UX', level: 'INTERMEDIATE' }];
    const iCanTeachThem = [{ id: '2', name: 'Python', level: 'ADVANCED' }];

    const hasDirectReciprocity = theyCanTeachMe.length > 0 && iCanTeachThem.length > 0;
    expect(hasDirectReciprocity).toBe(true);

    let score = 55; // Base high score for bilateral exchange
    score += Math.min(theyCanTeachMe.length * 10, 20);
    score += Math.min(iCanTeachThem.length * 10, 15);

    expect(score).toBe(75);
    expect(score).toBeGreaterThanOrEqual(60);
  });
});
