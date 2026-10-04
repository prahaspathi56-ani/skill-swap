export interface AIExplanationResult {
  explanation: string;
  hints: string[];
  practiceQuestion: string;
  suggestedAction?: string;
}

export interface AIRoadmapGenerated {
  title: string;
  targetRole: string;
  description: string;
  items: Array<{
    title: string;
    description: string;
    recommendedSkillName: string;
    order: number;
  }>;
}

export interface AISkillRecommendation {
  skillName: string;
  reason: string;
  learningTips: string;
  suggestedPractice: string;
}

export interface AIEnglishPracticeResult {
  reply: string;
  vocabularySuggestions: string[];
  grammarFeedback?: string;
  speakingPrompt?: string;
}

export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generateResponse(prompt: string, context?: any): Promise<string>;
  explainConcept(concept: string, studentQuestion?: string, level?: string): Promise<AIExplanationResult>;
  generateRoadmap(targetGoal: string): Promise<AIRoadmapGenerated>;
  recommendSkills(
    skillsLearning: string[],
    skillsTeaching: string[],
    goals: string[]
  ): Promise<AISkillRecommendation[]>;
  practiceEnglish(
    message: string,
    history: Array<{ role: string; content: string }>,
    level: string
  ): Promise<AIEnglishPracticeResult>;
}
