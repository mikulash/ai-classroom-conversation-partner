import { ConfigProvider } from '../utils/configProvider';
import {
  GetTTSAudioResponse,
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechRequest,
  TextToSpeechTimestampedRequest,
  TranscriptionSessionCreateResponse,
  WebRtcAnswerResponse,
} from '@repo/shared/types/apiFigurantClient';

import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { openAiApi } from '../api/openAiApi';
import { anthropicApi } from '../api/anthropicApi';
import { xAiApi } from '../api/xAiApi';
import { elevenLabsApi } from '../api/elevenLabsApi';
import { GetResponseParams, GetTimestampedTranscriptionParams } from '../types/api';

const getRealtimeTranscription = async (
  params: RealtimeTranscriptionRequest,
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
  }
};

const getRealtimeVoice = async (
  params: RealtimeVoiceRequest,
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
  }
};

const getTextToSpeech = async (
  params: TextToSpeechRequest,
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
  }
};

const getTextToSpeechTimestamped = async (
  params: TextToSpeechTimestampedRequest,
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
