import {
  GenerateReplyDto,
  RepliesApiFp,
  RealtimeTranscriptionDto,
  RealtimeVoiceDto,
  TextToSpeechDto,
  TextToSpeechTimestampedDto,
  AiProviderStatusDto,
} from './generated';
import {
  GenerateReplyRequest,
  GetTTSAudioResponse,
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechRequest,
  TextToSpeechTimestampedRequest,
  TranscriptionSessionCreateResponse,
  WebRtcAnswerResponse,
} from '../figurantClient.types';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { api } from './api';

const repliesApi = RepliesApiFp();

/**
 * Client for interacting with the Figurant backend API.
 * Uses the shared axios client from apiService for consistent auth handling.
 * Uses the generated RepliesApiFp internally; public signatures kept for backward compatibility.
 */
export class RepliesClient {
  async getResponse(request: GenerateReplyRequest): Promise<string> {
    const requestFn = await repliesApi.repliesControllerGenerateText(request as unknown as GenerateReplyDto);
    const response = await requestFn(api);
    return response.data;
  }

  async getSpeechAudio(params: TextToSpeechRequest): Promise<GetTTSAudioResponse> {
    const requestFn = await repliesApi.repliesControllerGenerateSpeech(params as unknown as TextToSpeechDto);
    const response = await requestFn(api);
    const data = response.data;

    const buffer = this.b64ToArrayBuffer(data.audioBase64);
    const blob = this.pcmArrayBufferToBlob(buffer, params.responseFormat);

    return {
      blob,
      objectUrl: URL.createObjectURL(blob),
      buffer,
      sampleRate: data.sampleRate,
    };
  }

  async getTimestampedSpeechAudio(params: TextToSpeechTimestampedRequest): Promise<LipSyncAudio> {
    const requestFn = await repliesApi.repliesControllerGenerateTimestampedSpeech(params as unknown as TextToSpeechTimestampedDto);
    const response = await requestFn(api);
    const data = response.data;

    return {
      ...data,
      audio: data.audio.map(this.b64ToArrayBuffer.bind(this)),
    };
  }

  async getFullReplyPlain(request: GenerateReplyRequest): Promise<{ text: string; speech: GetTTSAudioResponse }> {
    const requestFn = await repliesApi.repliesControllerGenerateFullPlain(request as unknown as GenerateReplyDto);
    const response = await requestFn(api);
    const data = response.data;

    const buffer = this.b64ToArrayBuffer(data.speech.audioBase64);
    const blob = this.pcmArrayBufferToBlob(buffer);

    return {
      text: data.text,
      speech: {
        blob,
        objectUrl: URL.createObjectURL(blob),
        buffer,
        sampleRate: data.speech.sampleRate,
      },
    };
  }

  async getFullReplyTimestamped(request: GenerateReplyRequest): Promise<{ text: string; speech: LipSyncAudio }> {
    const requestFn = await repliesApi.repliesControllerGenerateFullTimestamped(request as unknown as GenerateReplyDto);
    const response = await requestFn(api);
    const data = response.data;

    return {
      text: data.text,
      speech: {
        ...data.speech,
        audio: data.speech.audio.map(this.b64ToArrayBuffer.bind(this)),
      },
    };
  }

  async getWebRtcAnswer(request: RealtimeVoiceRequest): Promise<WebRtcAnswerResponse> {
    const dto: RealtimeVoiceDto = {
      sdpOffer: request.sdp_offer,
      personality: request.personality,
      conversationRole: request.conversationRole,
      language: request.language,
      scenario: request.scenario as unknown as object,
      userProfile: request.userProfile,
    };
    const requestFn = await repliesApi.repliesControllerRealtimeVoice(dto);
    const response = await requestFn(api);
    return response.data;
  }

  async getTranscriptionEphemeralToken(
    inputAudioFormat: string,
    language: RealtimeTranscriptionRequest['language'],
  ): Promise<TranscriptionSessionCreateResponse> {
    const body: RealtimeTranscriptionDto = {
      language: language,
    };

    const requestFn = await repliesApi.repliesControllerRealtimeTranscription(body);
    const response = await requestFn(api);
    return response.data as unknown as TranscriptionSessionCreateResponse;
  }

  async getAiProvidersAvailability(): Promise<AiProviderStatusDto[]> {
    const requestFn = await repliesApi.repliesControllerGetProviders();
    const response = await requestFn(api);
    return response.data;
  }


  /** Base‑64 → ArrayBuffer */
  private b64ToArrayBuffer(b64: string): ArrayBuffer {
    const binary = atob(b64);
    const len = binary.length;
    const buf = new ArrayBuffer(len);
    const view = new Uint8Array(buf);
    for (let i = 0; i < len; i++) view[i] = binary.charCodeAt(i);
    return buf;
  }

  private pcmArrayBufferToBlob(buf: ArrayBuffer, format: 'pcm' | 'mp3' = 'pcm'): Blob {
    return new Blob([buf], { type: `audio/${format}` });
  }
}

// Export a singleton instance for convenience
export const repliesClient = new RepliesClient();
