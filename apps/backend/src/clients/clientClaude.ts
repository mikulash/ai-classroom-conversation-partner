import Anthropic from '@anthropic-ai/sdk';
import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';

let claudeInstance: Anthropic | null = null;

export const getClaudeClient = async () => {
  if (!claudeInstance) {
    const apiKeysProvider = await ConfigProvider.getInstance();
    const apiKey = apiKeysProvider.getApiKey(API_KEY.CLAUDE);

    claudeInstance = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  return claudeInstance;
};

export const resetClaudeClient = () => {
  claudeInstance = null;
};
