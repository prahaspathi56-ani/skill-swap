import {
  AIProvider,
  AIExplanationResult,
  AIRoadmapGenerated,
  AISkillRecommendation,
  AIEnglishPracticeResult,
} from './AIProvider';
import { LocalSmartAIProvider } from './LocalSmartAIProvider';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI Provider';
  private apiKey: string;
  private model: string;
  private fallback: LocalSmartAIProvider;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
    this.fallback = new LocalSmartAIProvider();
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    if (!this.isAvailable()) {
      return this.fallback.generateResponse(prompt, context);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are SkillSwap AI, a supportive, concept-first student learning mentor. Never just give code directly without explaining principles. Break answers into Concept, Hint, and Guided Steps.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        console.warn('[OpenAIProvider] API returned error, falling back to LocalSmartAIProvider');
        return this.fallback.generateResponse(prompt, context);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.fallback.generateResponse(prompt, context);
    } catch (err) {
      console.warn('[OpenAIProvider] Fetch failed, falling back:', err);
      return this.fallback.generateResponse(prompt, context);
    }
  }

  async explainConcept(
    concept: string,
    studentQuestion?: string,
    level?: string
  ): Promise<AIExplanationResult> {
    if (!this.isAvailable()) {
      return this.fallback.explainConcept(concept, studentQuestion, level);
    }
    try {
      const prompt = `Student is learning concept: "${concept}". Student question: "${studentQuestion || ''}". Level: "${level || 'INTERMEDIATE'}".
Return JSON with:
{
  "explanation": "structured markdown explanation",
  "hints": ["hint1", "hint2", "hint3"],
  "practiceQuestion": "one thought-provoking practice question",
  "suggestedAction": "suggestion to practice or swap with a peer"
}`;
      const res = await this.generateResponse(prompt);
      const jsonMatch = res.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return this.fallback.explainConcept(concept, studentQuestion, level);
    } catch {
      return this.fallback.explainConcept(concept, studentQuestion, level);
    }
  }

  async generateRoadmap(targetGoal: string): Promise<AIRoadmapGenerated> {
    if (!this.isAvailable()) {
      return this.fallback.generateRoadmap(targetGoal);
    }
    try {
      const prompt = `Create a realistic student learning roadmap for goal: "${targetGoal}".
Return strictly valid JSON with:
{
  "title": "Title",
  "targetRole": "${targetGoal}",
  "description": "Short description",
  "items": [
    { "order": 1, "title": "Step 1", "description": "Step details", "recommendedSkillName": "Skill Category" }
  ]
}`;
      const res = await this.generateResponse(prompt);
      const jsonMatch = res.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return this.fallback.generateRoadmap(targetGoal);
    } catch {
      return this.fallback.generateRoadmap(targetGoal);
    }
  }

  async recommendSkills(
    skillsLearning: string[],
    skillsTeaching: string[],
    goals: string[]
  ): Promise<AISkillRecommendation[]> {
    return this.fallback.recommendSkills(skillsLearning, skillsTeaching, goals);
  }

  async practiceEnglish(
    message: string,
    history: Array<{ role: string; content: string }>,
    level: string
  ): Promise<AIEnglishPracticeResult> {
    return this.fallback.practiceEnglish(message, history, level);
  }
}
