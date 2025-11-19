import {
  FullReplyPlainResponse,
  FullReplyTimestampedResponse,
  GenerateReplyRequest,
  GetTTSAudioResponse,
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechRequest,
  TextToSpeechResponse,
  TextToSpeechTimestampedRequest,
  TextToSpeechTimestampedResponse,
  TranscriptionSessionCreateResponse,
  WebRtcAnswerResponse,
} from '@repo/shared/types/figurantClient.types';
import { LipSyncAudio } from '@repo/shared/types/talkingHead';
import { Language } from '@repo/shared/enums/Language';
import { AiProviderStatus } from '@repo/shared/types/apiKeyStatus';
import { api } from './api';


/**
 * Client for interacting with the Figurant backend API.
 * Uses the shared axios client from apiService for consistent auth handling.
 */
export class RepliesClient {
  async getResponse(request: GenerateReplyRequest): Promise<string> {
    const { data } = await api.post<string>(`/replies/text`, request);
    return data;
  }

  async getSpeechAudio(params: TextToSpeechRequest): Promise<GetTTSAudioResponse> {
    const { data } = await api.post<TextToSpeechResponse>(`/replies/speech`, params);

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
    const { data } = await api.post<TextToSpeechTimestampedResponse>(`/replies/speech/timestamped`, params);

    return {
      ...data,
      audio: data.audio.map(this.b64ToArrayBuffer.bind(this)),
    };
  }

  async getFullReplyPlain(request: GenerateReplyRequest): Promise<{ text: string; speech: GetTTSAudioResponse }> {
    const { data } = await api.post<FullReplyPlainResponse>(`/replies/full/plain`, request);

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
    const { data } = await api.post<FullReplyTimestampedResponse>(`/replies/full/timestamped`, request);

    return {
      text: data.text,
      speech: {
        ...data.speech,
        audio: data.speech.audio.map(this.b64ToArrayBuffer.bind(this)),
      },
    };
  }

  async getWebRtcAnswer(request: RealtimeVoiceRequest): Promise<WebRtcAnswerResponse> {
    const { data } = await api.post<WebRtcAnswerResponse>(`/replies/speech/realtime`, request);
    return data;
  }

  async getTranscriptionEphemeralToken(
    inputAudioFormat: string,
    language: Language,
  ): Promise<TranscriptionSessionCreateResponse> {
    const body: RealtimeTranscriptionRequest = {
      input_audio_format: inputAudioFormat,
      language: language,
    };

    const { data } = await api.post<TranscriptionSessionCreateResponse>(
      '/replies/transcription/realtime',
      body,
    );

    return data;
  }

  async getAiProvidersAvailability(): Promise<AiProviderStatus[]> {
    const { data } = await api.get<AiProviderStatus[]>(`/replies/providers`);
    return data;
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

  private pcmArrayBufferToBlob(buf: ArrayBuffer, format : 'pcm' | 'mp3'= 'pcm'): Blob {
    return new Blob([buf], { type: `audio/${format}` });
  }
}

// Export a singleton instance for convenience
export const repliesClient = new RepliesClient();
