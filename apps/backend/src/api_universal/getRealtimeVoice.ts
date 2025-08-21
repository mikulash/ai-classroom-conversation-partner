import { ConfigProvider } from '../utils/configProvider';
import { getRealtimeVoiceOpenAi } from '../api/getRealtimeVoiceOpenAI';
import { GetRealtimeVoiceParams } from '@repo/shared/types/apiClient';

export const getRealtimeVoice = async (params: GetRealtimeVoiceParams, userId: string) => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = realtimeModel;
  switch (provider) {
    case 'OpenAi':
      return getRealtimeVoiceOpenAi({ ...params, model_api_name }, userId);
    default:
      throw new Error('Unsupported transcription provider');
  }
};
