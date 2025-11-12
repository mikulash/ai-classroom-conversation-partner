import OpenAI from 'openai';
import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';

let grokInstance: OpenAI | null = null;

export const getGrokClient = async () => {
  if (!grokInstance) {
    const apiKeysProvider = await ConfigProvider.getInstance();

    const apiKey = apiKeysProvider.getApiKey(API_KEY.GROK);

    grokInstance = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
      dangerouslyAllowBrowser: true,
    });
  }

  return grokInstance;
};

export const resetGrokClient = () => {
  grokInstance = null;
};
