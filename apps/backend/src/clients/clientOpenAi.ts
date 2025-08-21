import OpenAI from 'openai';
import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';

let openaiInstance: OpenAI | null = null;

export const getOpenAIClient = async () => {
  if (!openaiInstance) {
    const apiKeysProvider = await ConfigProvider.getInstance();

    const apiKey = apiKeysProvider.getApiKey(API_KEY.OPENAI);

    if (!apiKey) {
      throw new Error('OpenAI API key is missing. Please add it in Settings.');
    }

    openaiInstance = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  return openaiInstance;
};

export const resetOpenAIClient = () => {
  openaiInstance = null;
};
