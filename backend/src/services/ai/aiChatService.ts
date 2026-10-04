import { config } from '../../config';
import { AIProvider } from './AIProvider';
import { LocalSmartAIProvider } from './LocalSmartAIProvider';
import { OpenAIProvider } from './OpenAIProvider';

export class AIService {
  private provider: AIProvider;

  constructor() {
    if (config.ai.provider === 'openai' && config.ai.apiKey) {
      this.provider = new OpenAIProvider(config.ai.apiKey, config.ai.model);
    } else {
      this.provider = new LocalSmartAIProvider();
    }
  }

  getProvider(): AIProvider {
    return this.provider;
  }
}

export const aiService = new AIService();
