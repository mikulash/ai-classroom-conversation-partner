import { ConfigProvider } from '../utils/configProvider';
import { GetResponseParams } from '@repo/shared/types/apiClient';
import { getOpenAiResponse } from '../api/getResponseOpenAi';
import { getClaudeResponse } from '../api/getResponseAnthropic';
import { getGrokResponse } from '../api/getResponseXAi';


export const getResponse = async (params: GetResponseParams, userId: string): Promise<string> => {
  const configProvider = await ConfigProvider.getInstance();
  const { responseModel } = await configProvider.getModelsForUser(userId);
  if (!responseModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = responseModel;
  switch (provider) {
    case 'OpenAi':
      return await getOpenAiResponse({ ...params, model_api_name });
    case 'Anthropic':
      return await getClaudeResponse({ ...params, model_api_name });
    case 'xAi':
      return await getGrokResponse({ ...params, model_api_name });
    default:
      throw new Error('Unsupported response provider');
  }
};
