import { Injectable } from '@nestjs/common';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { AnthropicApiService } from './anthropicApi';
import { ElevenLabsApiService } from './elevenLabsApi';
import { OpenAiApiService } from './openAiApi';
import { XAiApiService } from './xAiApi';
import { TranscriptionSessionCreateResponseDto, WebRtcAnswerResponseDto } from '../dtos/replies.dto';
import {
  GetRealtimeTranscriptionParams,
  GetRealtimeVoiceParams,
  GetResponseParams,
  GetSpeechAudioParams,
  GetTimestampedSpeechAudioParams,
  GetTimestampedTranscriptionParams,
  SpeechAudioResult,
} from '../types/universalApi.types';
import { ConfigProvider } from '../utils/configProvider';

@Injectable()
export class UniversalApiService {
  constructor(
    private readonly configProvider: ConfigProvider,
    private readonly openAiApi: OpenAiApiService,
    private readonly anthropicApi: AnthropicApiService,
    private readonly xAiApi: XAiApiService,
    private readonly elevenLabsApi: ElevenLabsApiService,
  ) {}

  public async getRealtimeTranscription(
    params: GetRealtimeTranscriptionParams,
    userId: string,
  ): Promise<TranscriptionSessionCreateResponseDto> {
    const { realtimeTranscriptionModel } = await this.configProvider.getModelsForUser(userId);
    if (!realtimeTranscriptionModel) {
      throw new Error('No models loaded');
    }

    return this.openAiApi.getRealtimeTranscriptionToken({
      ...params,
      modelApiName: realtimeTranscriptionModel.apiName,
    });
  }

  public async getRealtimeVoice(
    params: GetRealtimeVoiceParams,
    userId: string,
  ): Promise<WebRtcAnswerResponseDto> {
    const { realtimeModel } = await this.configProvider.getModelsForUser(userId);
    if (!realtimeModel) {
      throw new Error('No models loaded');
    }

    return this.openAiApi.getRealtimeVoice({
      ...params,
      modelApiName: realtimeModel.apiName,
    }, userId);
  }

  public async getResponse(
    params: GetResponseParams,
    userId: string,
  ): Promise<string> {
    const { responseModel } = await this.configProvider.getModelsForUser(userId);
    if (!responseModel) {
      throw new Error('No models loaded');
    }

    const { provider, apiName: modelApiName } = responseModel;
    switch (provider) {
      case 'OpenAi':
        return this.openAiApi.getResponse({ ...params, modelApiName });
      case 'Anthropic':
        return this.anthropicApi.getResponse({ ...params, modelApiName });
      case 'xAi':
        return this.xAiApi.getResponse({ ...params, modelApiName });
    }
  }

  public async getSpeechAudio(
    params: GetSpeechAudioParams,
    userId: string,
  ): Promise<SpeechAudioResult> {
    const { ttsModel } = await this.configProvider.getModelsForUser(userId);
    if (!ttsModel) {
      throw new Error('No models loaded');
    }

    const { provider, apiName, sampleRate } = ttsModel;
    switch (provider) {
      case 'OpenAi':
        return this.openAiApi.getTextToSpeech({
          ...params,
          modelApiName: apiName,
          sampleRate,
        });
      case 'ElevenLabs':
        return this.elevenLabsApi.textToSpeech({
          ...params,
          modelApiName: apiName,
          sampleRate,
        });
    }
  }

  public async getTimestampedSpeechAudio(
    params: GetTimestampedSpeechAudioParams,
    userId: string,
  ): Promise<LipSyncAudio> {
    const { ttsModel } = await this.configProvider.getModelsForUser(userId);
    if (!ttsModel) {
      throw new Error('No models loaded');
    }

    const { provider, apiName, sampleRate } = ttsModel;
    switch (provider) {
      case 'OpenAi':
        return this.openAiApi.getTextToSpeechTimestamped(
          { ...params, modelApiName: apiName, sampleRate },
          userId,
        );
      case 'ElevenLabs':
        return this.elevenLabsApi.getTextToSpeechTimestamped({
          ...params,
          modelApiName: apiName,
          sampleRate,
        });
    }
  }

  public async getTimestampedTranscription(
    params: GetTimestampedTranscriptionParams,
    userId: string,
  ) {
    const { timestampedTranscriptionModel } = await this.configProvider.getModelsForUser(userId);
    if (!timestampedTranscriptionModel) {
      throw new Error('No models loaded');
    }

    return this.openAiApi.createTimestampedTranscription({
      ...params,
      modelApiName: timestampedTranscriptionModel.apiName,
    });
  }
}
