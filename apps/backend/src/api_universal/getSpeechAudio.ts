import { ConfigProvider } from '../utils/configProvider';
import { textToSpeechOpenAi } from '../api/getSpeechAudioOpenAi';
import { textToSpeechEleven } from '../api/getSpeechAudioEleven';
import { GetTTSAudioParams, GetTTSAudioResponse } from '@repo/shared/types/apiClient';

export const getSpeechAudio = async (params: GetTTSAudioParams, userId : string): Promise<GetTTSAudioResponse> => {
  const configProvider = await ConfigProvider.getInstance();
  const { ttsModel } = await configProvider.getModelsForUser(userId);
  if (!ttsModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name, sample_rate } = ttsModel;
  console.log('getting speech audio from ', provider, api_name);
  switch (provider) {
    case 'OpenAi':
      return await textToSpeechOpenAi({
        ...params,
        model_api_name: api_name,
        sample_rate,
      });
    case 'ElevenLabs':
      return await textToSpeechEleven({
        ...params,
        model_api_name: api_name,
        sample_rate,
      });
    default:
      throw new Error('Unsupported TTS provider');
  }
};
