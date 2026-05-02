import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AnthropicApiService } from './anthropicApi';
import { ElevenLabsApiService } from './elevenLabsApi';
import { OpenAiApiService } from './openAiApi';
import { XAiApiService } from './xAiApi';
import {
  TextToSpeechTimestampedResponseDto,
  TranscriptionSessionCreateResponseDto,
  WebRtcAnswerResponseDto,
} from '../dtos/replies.dto';
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
  private readonly responseProviders: Record<string, (params: GetResponseParams & { modelApiName: string }) => Promise<string>>;
  private readonly ttsProviders: Record<string, (params: GetSpeechAudioParams & { modelApiName: string; sampleRate: number }) => Promise<SpeechAudioResult>>;
  private readonly timestampedTtsProviders: Record<string, (params: GetTimestampedSpeechAudioParams & { modelApiName: string; sampleRate: number }, userId: string) => Promise<TextToSpeechTimestampedResponseDto>>;

  constructor(
    private readonly configProvider: ConfigProvider,
    private readonly openAiApi: OpenAiApiService,
    private readonly anthropicApi: AnthropicApiService,
    private readonly xAiApi: XAiApiService,
    private readonly elevenLabsApi: ElevenLabsApiService,
  ) {
    this.responseProviders = {
      OpenAi: (params) => this.openAiApi.getResponse(params),
      Anthropic: (params) => this.anthropicApi.getResponse(params),
      xAi: (params) => this.xAiApi.getResponse(params),
    };
    this.ttsProviders = {
      OpenAi: (params) => this.openAiApi.getTextToSpeech(params),
      ElevenLabs: (params) => this.elevenLabsApi.textToSpeech(params),
    };
    this.timestampedTtsProviders = {
      OpenAi: (params, userId) => this.openAiApi.getTextToSpeechTimestamped(params, userId),
      ElevenLabs: (params) => this.elevenLabsApi.getTextToSpeechTimestamped(params),
    };
  }

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
    return this.getProvider(this.responseProviders, provider, 'response')({ ...params, modelApiName });
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
    return this.getProvider(this.ttsProviders, provider, 'text-to-speech')({
      ...params,
      modelApiName: apiName,
      sampleRate,
    });
  }

  public async getTimestampedSpeechAudio(
    params: GetTimestampedSpeechAudioParams,
    userId: string,
  ): Promise<TextToSpeechTimestampedResponseDto> {
    const { ttsModel } = await this.configProvider.getModelsForUser(userId);
    if (!ttsModel) {
      throw new Error('No models loaded');
    }

    const { provider, apiName, sampleRate } = ttsModel;
    return this.getProvider(this.timestampedTtsProviders, provider, 'timestamped text-to-speech')({
      ...params,
      modelApiName: apiName,
      sampleRate,
    }, userId);
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

  private getProvider<T>(
    providers: Partial<Record<string, T>>,
    provider: string,
    capability: string,
  ): T {
    const selectedProvider = providers[provider];
    if (!selectedProvider) {
      throw new InternalServerErrorException(`Configured ${capability} provider is not supported`);
    }
    return selectedProvider;
  }
}
