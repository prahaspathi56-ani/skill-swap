import { prisma } from '../db/prisma';

export interface SkillMatchResult {
  userId: string;
  name: string;
  email: string;
  college: string | null;
  department: string | null;
  year: string | null;
  avatarUrl: string | null;
  bio: string | null;
  availability: string | null;
  languages: string;
  learningHours: number;
  teachingHours: number;
  ratingAverage: number;
  reviewCount: number;
  compatibilityScore: number;
  matchBadge: 'Great Skill Match' | 'High Compatibility' | 'Potential Match';
  matchReason: string;
  theyCanTeachYou: Array<{ id: string; name: string; level: string }>;
  youCanTeachThem: Array<{ id: string; name: string; level: string }>;
}

export class MatchingService {
  /**
   * Find student matches for a given user based on reciprocal skill exchange.
   */
  async findMatchesForUser(userId: string): Promise<SkillMatchResult[]> {
    // 1. Fetch current user with their skills, goals, college, languages
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: { skill: true },
        },
        learningGoals: true,
      },
    });

    if (!currentUser) return [];

    const mySkillsToTeach = currentUser.skills.filter((s) => s.type === 'TEACH');
    const mySkillsToLearn = currentUser.skills.filter((s) => s.type === 'LEARN');

    const myTeachSkillIds = new Set(mySkillsToTeach.map((s) => s.skillId));
    const myLearnSkillIds = new Set(mySkillsToLearn.map((s) => s.skillId));

    // 2. Fetch all other students with their skills, goals, reviews
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        visibility: { not: 'PRIVATE' },
      },
      include: {
        skills: {
          include: { skill: true },
        },
        learningGoals: true,
        reviewsReceived: {
          select: { rating: true, teachingClarity: true },
        },
      },
      take: 50,
    });

    const matches: SkillMatchResult[] = [];

    for (const other of otherUsers) {
      const otherTeach = other.skills.filter((s) => s.type === 'TEACH');
      const otherLearn = other.skills.filter((s) => s.type === 'LEARN');

      // They teach what I want to learn
      const theyCanTeachMe = otherTeach.filter((s) => myLearnSkillIds.has(s.skillId));
      // I teach what they want to learn
      const iCanTeachThem = mySkillsToTeach.filter((s) =>
        otherLearn.some((ol) => ol.skillId === s.skillId)
      );

      // Reciprocal match check
      const hasDirectReciprocity = theyCanTeachMe.length > 0 && iCanTeachThem.length > 0;
      const hasOneWayTeach = theyCanTeachMe.length > 0;
      const hasOneWayLearn = iCanTeachThem.length > 0;

      if (!hasOneWayTeach && !hasOneWayLearn) {
        continue; // No overlap at all
      }

      // Calculate compatibility score (out of 100)
      let score = 0;

      if (hasDirectReciprocity) {
        score += 55; // Base high score for bilateral exchange
        score += Math.min(theyCanTeachMe.length * 10, 20);
        score += Math.min(iCanTeachThem.length * 10, 15);
      } else {
        score += 35;
        if (hasOneWayTeach) score += Math.min(theyCanTeachMe.length * 8, 15);
        if (hasOneWayLearn) score += Math.min(iCanTeachThem.length * 8, 15);
      }

      // College proximity boost
      if (currentUser.college && other.college && currentUser.college === other.college) {
        score += 5;
      }

      // Language overlap boost
      const myLanguages = currentUser.languages.split(',').map((l) => l.trim().toLowerCase());
      const otherLanguages = other.languages.split(',').map((l) => l.trim().toLowerCase());
      const commonLang = myLanguages.filter((l) => otherLanguages.includes(l));
      if (commonLang.length > 0) {
        score += 5;
      }

      // Teaching rating boost
      const reviews = other.reviewsReceived;
      const reviewCount = reviews.length;
      const ratingAverage =
        reviewCount > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
          : 5.0;

      if (reviewCount > 0 && ratingAverage >= 4.5) {
        score += 5;
      }

      // Cap at 98 (leave room for humility)
      const finalScore = Math.min(score, 98);

      let matchBadge: 'Great Skill Match' | 'High Compatibility' | 'Potential Match' =
        'Potential Match';
      if (finalScore >= 80) {
        matchBadge = 'Great Skill Match';
      } else if (finalScore >= 60) {
        matchBadge = 'High Compatibility';
      }

      // Construct pedagogical student-friendly match reason
      let matchReason = '';
      if (hasDirectReciprocity) {
        const myGain = theyCanTeachMe[0]?.skill.name;
        const theirGain = iCanTeachThem[0]?.skill.name;
        matchReason = `You can help each other! ${other.name} can teach you ${myGain}, and you can teach them ${theirGain}.`;
      } else if (hasOneWayTeach) {
        matchReason = `${other.name} can teach you ${theyCanTeachMe.map((s) => s.skill.name).join(', ')}.`;
      } else {
        matchReason = `You have skills in ${iCanTeachThem.map((s) => s.skill.name).join(', ')} that ${other.name} is looking to learn.`;
      }

      matches.push({
        userId: other.id,
        name: other.name,
        email: other.email,
        college: other.college,
        department: other.department,
        year: other.year,
        avatarUrl: other.avatarUrl,
        bio: other.bio,
        availability: other.availability,
        languages: other.languages,
        learningHours: other.learningHours,
        teachingHours: other.teachingHours,
        ratingAverage,
        reviewCount,
        compatibilityScore: finalScore,
        matchBadge,
        matchReason,
        theyCanTeachYou: theyCanTeachMe.map((s) => ({
          id: s.skillId,
          name: s.skill.name,
          level: s.level,
        })),
        youCanTeachThem: iCanTeachThem.map((s) => ({
          id: s.skillId,
          name: s.skill.name,
          level: s.level,
        })),
      });
    }

    // Sort by compatibility score descending
    return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}

export const matchingService = new MatchingService();
