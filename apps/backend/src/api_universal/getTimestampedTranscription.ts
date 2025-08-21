import { ConfigProvider } from '../utils/configProvider';
import { GetTimestampedTranscriptionParams } from '@repo/shared/types/apiClient';
import { createTimestampedTranscriptionOpenAi } from '../api/getTimestampedTranscriptionOpenAi';


export const getTimestampedTranscription = async (params: GetTimestampedTranscriptionParams, userId: string) => {
  const configProvider = await ConfigProvider.getInstance();
  const { timestampedTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!timestampedTranscriptionModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = timestampedTranscriptionModel;
  switch (provider) {
    case 'OpenAi':
      return createTimestampedTranscriptionOpenAi({ ...params, model_api_name });
    default:
      throw new Error('Unsupported transcription provider');
  }
};
