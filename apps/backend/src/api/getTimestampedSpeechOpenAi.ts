import { GetTimestampedAudioParamsWithModelName } from '@repo/shared/types/timestampedSpeech';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { textToSpeechOpenAi } from './getSpeechAudioOpenAi';
import { getPreciseLipSyncAudio } from '../utils/lipsyncUtils';

export async function getOpenAiTimestampedAudio(
  params: GetTimestampedAudioParamsWithModelName,
  userId: string,
): Promise<LipSyncAudio> {
  const { inputMessage, personality, language, model_api_name, sample_rate } = params;
  const audioResponse = await textToSpeechOpenAi(
    {
      inputMessage,
      personality,
      language,
      response_format: 'pcm',
      model_api_name,
      sample_rate,
    },
  );

  const lipSyncAudio = await getPreciseLipSyncAudio(
    audioResponse.buffer,
    audioResponse.sampleRate,
    2,
    1,
    userId,
    language,
  );

  return lipSyncAudio;
}
