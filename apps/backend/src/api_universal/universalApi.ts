import { ConfigProvider } from '../utils/configProvider';
import {
  GetRealtimeTranscriptionParams,
  GetRealtimeVoiceParams,
  GetResponseParams,
  GetTTSAudioParams,
  GetTTSAudioResponse,
  GetTimestampedTranscriptionParams,
} from '@repo/shared/types/apiClient';
import { GetTimestampedAudioParams } from '@repo/shared/types/timestampedSpeech';
import {
  TranscriptionSessionCreateResponse,
  WebRtcAnswerResponse,
} from '@repo/shared/types/api/webRTC';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { openAiApi } from '../api/openAiApi';
import { anthropicApi } from '../api/anthropicApi';
import { xAiApi } from '../api/xAiApi';
import { elevenLabsApi } from '../api/elevenLabsApi';

const getRealtimeTranscription = async (
  params: GetRealtimeTranscriptionParams,
  userId: string,
): Promise<TranscriptionSessionCreateResponse> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeTranscriptionModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = realtimeTranscriptionModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getRealtimeTranscriptionToken({ ...params, model_api_name });
    default:
      throw new Error('Unsupported transcription provider');
  }
};

const getRealtimeVoice = async (
  params: GetRealtimeVoiceParams,
  userId: string,
): Promise<WebRtcAnswerResponse> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = realtimeModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getRealtimeVoice({ ...params, model_api_name }, userId);
    default:
      throw new Error('Unsupported realtime voice provider');
  }
};

const getResponse = async (
  params: GetResponseParams,
  userId: string,
): Promise<string> => {
  const configProvider = await ConfigProvider.getInstance();
  const { responseModel } = await configProvider.getModelsForUser(userId);
  if (!responseModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = responseModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getResponse({ ...params, model_api_name });
    case 'Anthropic':
      return anthropicApi.getResponse({ ...params, model_api_name });
    case 'xAi':
      return xAiApi.getResponse({ ...params, model_api_name });
    default:
      throw new Error('Unsupported response provider');
  }
};

const getTextToSpeech = async (
  params: GetTTSAudioParams,
  userId: string,
): Promise<GetTTSAudioResponse> => {
  const configProvider = await ConfigProvider.getInstance();
  const { ttsModel } = await configProvider.getModelsForUser(userId);
  if (!ttsModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name, sample_rate } = ttsModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getTextToSpeech({
        ...params,
        model_api_name: api_name,
        sample_rate,
      });
    case 'ElevenLabs':
      return elevenLabsApi.textToSpeech({
        ...params,
        model_api_name: api_name,
        sample_rate,
      });
    default:
      throw new Error('Unsupported TTS provider');
  }
};

const getTextToSpeechTimestamped = async (
  params: GetTimestampedAudioParams,
  userId: string,
): Promise<LipSyncAudio> => {
  const configProvider = await ConfigProvider.getInstance();
  const { ttsModel } = await configProvider.getModelsForUser(userId);
  if (!ttsModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name, sample_rate } = ttsModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getTextToSpeechTimestamped(
        { ...params, model_api_name: api_name, sample_rate },
        userId,
      );
    case 'ElevenLabs':
      return elevenLabsApi.getTextToSpeechTimestamped({
        ...params,
        model_api_name: api_name,
        sample_rate,
      });
    default:
      throw new Error('Unsupported timestamped TTS provider');
  }
};

const getTimestampedTranscription = async (
  params: GetTimestampedTranscriptionParams,
  userId: string,
) => {
  const configProvider = await ConfigProvider.getInstance();
  const { timestampedTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!timestampedTranscriptionModel) {
    throw new Error('No models loaded');
  }
  const { provider, api_name: model_api_name } = timestampedTranscriptionModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.createTimestampedTranscription({ ...params, model_api_name });
    default:
      throw new Error('Unsupported transcription provider');
  }
};

export const universalApi = {
  getRealtimeTranscription,
  getRealtimeVoice,
  getResponse,
  getSpeechAudio: getTextToSpeech,
  getTimestampedSpeechAudio: getTextToSpeechTimestamped,
  getTimestampedTranscription,
};
