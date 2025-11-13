import OpenAI from 'openai';
import { ConfigProvider } from '../utils/configProvider';
import { API_KEY } from '@repo/shared/enums/ApiKey';

let openaiInstance: OpenAI | null = null;

export const getOpenAIClient = async () => {
  if (!openaiInstance) {
    const apiKeysProvider = await ConfigProvider.getInstance();

    const apiKey = apiKeysProvider.getApiKey(API_KEY.OPENAI);

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
