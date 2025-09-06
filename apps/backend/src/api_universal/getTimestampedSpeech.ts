import { ConfigProvider } from '../utils/configProvider';
import { getOpenAiTimestampedAudio } from '../api/getTimestampedSpeechOpenAi';
import { getElevenLabsTimestampedAudio } from '../api/getTimestampedSpeechElevenLabs';
import { GetTimestampedAudioParams } from '@repo/shared/types/timestampedSpeech';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';

export const getTimestampedSpeechAudio = async (
  params: GetTimestampedAudioParams, userId: string,
): Promise<LipSyncAudio> => {
  const configProvider = await ConfigProvider.getInstance();
  const { ttsModel } = await configProvider.getModelsForUser(userId);
  if (!ttsModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name, sample_rate } = ttsModel;

  console.log('getting timestamped speech audio from ', provider, api_name);
  switch (provider) {
    case 'OpenAi':
      return await getOpenAiTimestampedAudio({
        ...params,
        model_api_name: api_name,
        sample_rate,

      }, userId,
      );
    case 'ElevenLabs':
      return await getElevenLabsTimestampedAudio({
        ...params,
        model_api_name: api_name,
        sample_rate,
      });
    default:
      throw new Error('Unsupported TTS provider');
  }
};
