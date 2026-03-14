import { ConfigProvider } from '../utils/configProvider';
import {
  GetRealtimeTranscriptionParams,
  GetRealtimeVoiceParams,
  GetResponseParams,
  GetSpeechAudioParams,
  GetTimestampedSpeechAudioParams,
  GetTimestampedTranscriptionParams,
  SpeechAudioResult,
} from '../types/universalApi.types';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { TranscriptionSessionCreateResponseDto, WebRtcAnswerResponseDto } from '../dtos/replies.dto';
import { openAiApi } from './openAiApi';
import { anthropicApi } from './anthropicApi';
import { xAiApi } from './xAiApi';
import { elevenLabsApi } from './elevenLabsApi';

const getRealtimeTranscription = async (
  params: GetRealtimeTranscriptionParams,
  userId: string,
): Promise<TranscriptionSessionCreateResponseDto> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeTranscriptionModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeTranscriptionModel) {
    throw new Error('No models loaded');
  }
  const { provider, apiName: modelApiName } = realtimeTranscriptionModel;
  switch (provider) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'OpenAi':
      return openAiApi.getRealtimeTranscriptionToken({ ...params, modelApiName: modelApiName });
  }
};

const getRealtimeVoice = async (
  params: GetRealtimeVoiceParams,
  userId: string,
): Promise<WebRtcAnswerResponseDto> => {
  const configProvider = await ConfigProvider.getInstance();
  const { realtimeModel } = await configProvider.getModelsForUser(userId);
  if (!realtimeModel) {
    throw new Error('No models loaded');
  }
  const { provider, apiName: modelApiName } = realtimeModel;
  switch (provider) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'OpenAi':
      return openAiApi.getRealtimeVoice({ ...params, modelApiName: modelApiName }, userId);
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
  const { provider, apiName: modelApiName } = responseModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getResponse({ ...params, modelApiName: modelApiName });
    case 'Anthropic':
      return anthropicApi.getResponse({ ...params, modelApiName: modelApiName });
    case 'xAi':
      return xAiApi.getResponse({ ...params, modelApiName: modelApiName });
  }
};

const getTextToSpeech = async (
  params: GetSpeechAudioParams,
  userId: string,
): Promise<SpeechAudioResult> => {
  const configProvider = await ConfigProvider.getInstance();
  const { ttsModel } = await configProvider.getModelsForUser(userId);
  if (!ttsModel) {
    throw new Error('No models loaded');
  }
  const { provider, apiName, sampleRate } = ttsModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getTextToSpeech({
        ...params,
        modelApiName: apiName,
        sampleRate: sampleRate,
      });
    case 'ElevenLabs':
      return elevenLabsApi.textToSpeech({
        ...params,
        modelApiName: apiName,
        sampleRate: sampleRate,
      });
  }
};

const getTextToSpeechTimestamped = async (
  params: GetTimestampedSpeechAudioParams,
  userId: string,
): Promise<LipSyncAudio> => {
  const configProvider = await ConfigProvider.getInstance();
  const { ttsModel } = await configProvider.getModelsForUser(userId);
  if (!ttsModel) {
    throw new Error('No models loaded');
  }
  const { provider, apiName, sampleRate } = ttsModel;
  switch (provider) {
    case 'OpenAi':
      return openAiApi.getTextToSpeechTimestamped(
        { ...params, modelApiName: apiName, sampleRate: sampleRate },
        userId,
      );
    case 'ElevenLabs':
      return elevenLabsApi.getTextToSpeechTimestamped({
        ...params,
        modelApiName: apiName,
        sampleRate: sampleRate,
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
  const { provider, apiName: modelApiName } = timestampedTranscriptionModel;
  switch (provider) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case 'OpenAi':
      return openAiApi.createTimestampedTranscription({ ...params, modelApiName: modelApiName });
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
