import { ConfigProvider } from '../utils/configProvider';
import { GetRealtimeTranscriptionParams } from '@repo/shared/types/apiClient';
import { getEphemeralTranscriptionTokenOpenAi } from '../api/getRealtimeTranscriptionOpenAI';
import { TranscriptionSessionCreateResponse } from '@repo/shared/types/api/webRTC';

export const getRealtimeTranscription = async (params: GetRealtimeTranscriptionParams, userId: string): Promise<TranscriptionSessionCreateResponse> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeTranscriptionModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = realtimeTranscriptionModel;
  switch (provider) {
    case 'OpenAi':
      return getEphemeralTranscriptionTokenOpenAi({ ...params, model_api_name });
    default:
      throw new Error('Unsupported transcription provider');
  }
};
