// SkillSwap Shared Types & Constants

export type Role = 'STUDENT' | 'MODERATOR' | 'ADMIN';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type SwapStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTER_PROPOSED' | 'CANCELLED';

export type SessionStatus = 'SCHEDULED' | 'STARTING_SOON' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export type NotificationType =
  | 'SWAP_REQUEST'
  | 'SWAP_ACCEPTED'
  | 'SWAP_DECLINED'
  | 'NEW_MESSAGE'
  | 'SESSION_REMINDER'
  | 'SESSION_STARTING'
  | 'QUESTION_ANSWER'
  | 'MENTION'
  | 'GROUP_ACTIVITY'
  | 'AI_RECOMMENDATION'
  | 'ACHIEVEMENT_UNLOCKED';

export type ProfileVisibility = 'PUBLIC' | 'STUDENTS_ONLY' | 'PRIVATE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  avatarUrl?: string | null;
  college?: string | null;
  department?: string | null;
  year?: string | null;
  bio?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  visibility: ProfileVisibility;
  availability?: string | null; // e.g. "Weekdays 6-9 PM, Weekends"
  languages: string[];
  learningHours: number;
  teachingHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  categoryId: string;
  category?: SkillCategory;
  description?: string;
  isCustom: boolean;
  createdByUserId?: string | null;
  createdAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skill: Skill;
  type: 'TEACH' | 'LEARN';
  level: SkillLevel;
  description?: string | null;
  yearsOfExperience?: number | null;
}

export interface SkillSwapRequest {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  offeredSkillId: string;
  offeredSkill?: Skill;
  requestedSkillId: string;
  requestedSkill?: Skill;
  message: string;
  preferredTime: string;
  durationMinutes: number;
  counterProposedTime?: string | null;
  status: SwapStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SkillSwapConnection {
  id: string;
  user1Id: string;
  user1?: User;
  user2Id: string;
  user2?: User;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  sessionId?: string | null;
  session?: Session | null;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants?: User[];
  lastMessage?: Message | null;
  updatedAt: string;
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  description?: string | null;
  skillId: string;
  skill?: Skill;
  hostId: string;
  host?: User;
  participantId: string;
  participant?: User;
  scheduledStartTime: string;
  durationMinutes: number;
  status: SessionStatus;
  meetingRoomId: string;
  agenda?: string | null;
  sessionNotes?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  reviewee?: User;
  rating: number; // 1-5
  teachingClarity: number; // 1-5
  sessionQuality: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: User;
  categoryId: string;
  category?: SkillCategory;
  tags: string[];
  views: number;
  voteCount: number;
  answerCount: number;
  aiAssistanceAnswer?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  author?: User;
  content: string;
  voteCount: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author?: User;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  createdAt: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  creatorId: string;
  creator?: User;
  memberCount: number;
  isPrivate: boolean;
  topics: string[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: 'LEARNING' | 'TEACHING' | 'COMMUNITY' | 'STREAK';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  description: string;
  progressPercent: number;
  items: RoadmapItem[];
  createdAt: string;
}

export interface RoadmapItem {
  id: string;
  roadmapId: string;
  title: string;
  description: string;
  order: number;
  isCompleted: boolean;
  recommendedSkillName?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  description: string;
  starterCode: Record<string, string>; // language -> code template
  testCases: {
    input: string;
    expectedOutput: string;
    isSecret?: boolean;
  }[];
  hints: string[];
}

export interface CodingSubmission {
  id: string;
  problemId: string;
  userId: string;
  language: string;
  code: string;
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface MatchRecommendation {
  user: User;
  compatibilityScore: number;
  teachMatch: Skill[]; // Skills they teach that you want
  learnMatch: Skill[]; // Skills you teach that they want
  matchReason: string;
}

export const SKILL_CATEGORIES = [
  'Programming',
  'Web Development',
  'AI & ML',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'DevOps',
  'UI/UX',
  'Graphic Design',
  'Video Editing',
  'Photography',
  'Communication',
  'English',
  'Public Speaking',
  'Leadership',
  'Entrepreneurship',
  'Marketing',
  'Finance',
  'Research',
  'Mathematics',
  'Science',
  'Languages',
  'Music',
  'Sports',
  'Other',
] as const;

export const ACHIEVEMENTS_LIST: Array<Omit<Achievement, 'id'>> = [
  {
    code: 'FIRST_SKILL_SHARED',
    title: 'First Skill Shared',
    description: 'Listed your first skill to teach fellow students.',
    icon: 'Sparkles',
    category: 'TEACHING',
  },
  {
    code: 'FIRST_SKILL_LEARNED',
    title: 'Curious Mind',
    description: 'Completed your very first learning session on SkillSwap.',
    icon: 'GraduationCap',
    category: 'LEARNING',
  },
  {
    code: 'FIRST_SWAP_COMPLETED',
    title: 'Reciprocal Learner',
    description: 'Successfully completed a full bilateral skill exchange.',
    icon: 'Repeat',
    category: 'COMMUNITY',
  },
  {
    code: 'TEN_SESSIONS_COMPLETED',
    title: 'Seasoned Exchanger',
    description: 'Conducted 10 collaborative learning & teaching sessions.',
    icon: 'Award',
    category: 'COMMUNITY',
  },
  {
    code: 'HELPFUL_ANSWER',
    title: 'Student Beacon',
    description: 'Received 5+ upvotes on an answer in Question Hub.',
    icon: 'ThumbsUp',
    category: 'COMMUNITY',
  },
  {
    code: 'ENGLISH_PRACTICE_STREAK',
    title: 'Confident Speaker',
    description: 'Engaged in 3 English conversation & vocabulary practice runs.',
    icon: 'MessageSquare',
    category: 'LEARNING',
  },
  {
    code: 'CODING_CHAMPION',
    title: 'Bug Crusher',
    description: 'Solved 3 or more coding challenges.',
    icon: 'Code',
    category: 'LEARNING',
  },
  {
    code: 'KNOWLEDGE_SHARER',
    title: 'Knowledge Sharer',
    description: 'Earned a 5-star rating for teaching clarity in a session.',
    icon: 'Star',
    category: 'TEACHING',
  },
];
