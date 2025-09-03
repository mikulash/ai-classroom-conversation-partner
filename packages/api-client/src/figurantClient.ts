import axios, { AxiosInstance } from 'axios';
import {
  AvatarReplyRequest,
  FullReplyPlainResponse,
  FullReplyTimestampedResponse,
} from '@repo/shared/types/api/avatarReply';
import {
  GetRealtimeTranscriptionParams,
  GetRealtimeVoiceParams,
  GetTTSAudioParams,
  GetTTSAudioResponse,
  GetTTSAudioResponseForWebTransfer,
} from '@repo/shared/types/apiClient';
import { GetTimestampedAudioParams } from '@repo/shared/types/timestampedSpeech';
import { LipSyncAudio, LipSyncAudioWebTransfer } from '@repo/shared/types/talkingHead';
import { TranscriptionSessionCreateResponse, WebRtcAnswerResponse } from '@repo/shared/types/api/webRTC';
import { RegisterUserBody } from '@repo/shared/types/api/RegisterUserBody';
import { AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { Language } from '@repo/shared/types/language';
import { ApiKeysStatus } from '@repo/shared/types/apiKeyStatus';


/**
 * Client for interacting with the Figurant backend API.
 */
export class FigurantApiClient {
  private readonly axios: AxiosInstance;

  constructor(baseUrl?: string) {
    this.axios = axios.create({
      baseURL: baseUrl ?? import.meta.env.VITE_BACKEND_URL,
    });

    this.axios.interceptors.request.use(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });
  }

  async getResponse(request: AvatarReplyRequest): Promise<string> {
    const { data } = await this.axios.post<string>(`/replies/text`, request);
    return data;
  }

  async getSpeechAudio(params: GetTTSAudioParams): Promise<GetTTSAudioResponse> {
    const { data } = await this.axios.post<GetTTSAudioResponseForWebTransfer>(`/replies/speech`, params);

    const buffer = this.b64ToArrayBuffer(data.audioBase64);
    const blob = this.pcmArrayBufferToBlob(buffer, params.response_format ?? 'pcm');

    return {
      blob,
      objectUrl: URL.createObjectURL(blob),
      buffer,
      sampleRate: data.sampleRate,
    };
  }

  async getTimestampedSpeechAudio(params: GetTimestampedAudioParams): Promise<LipSyncAudio> {
    const { data } = await this.axios.post<LipSyncAudioWebTransfer>(`/replies/speech/timestamped`, params);

    return {
      ...data,
      audio: data.audio.map(this.b64ToArrayBuffer.bind(this)),
    };
  }

  async getFullReplyPlain(request: AvatarReplyRequest): Promise<{ text: string; speech: GetTTSAudioResponse }> {
    const { data } = await this.axios.post<FullReplyPlainResponse>(`/replies/full/plain`, request);

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

  async getFullReplyTimestamped(request: AvatarReplyRequest): Promise<{ text: string; speech: LipSyncAudio }> {
    const { data } = await this.axios.post<FullReplyTimestampedResponse>(`/replies/full/timestamped`, request);

    return {
      text: data.text,
      speech: {
        ...data.speech,
        audio: data.speech.audio.map(this.b64ToArrayBuffer.bind(this)),
      },
    };
  }

  async getWebRtcAnswer(request: GetRealtimeVoiceParams): Promise<WebRtcAnswerResponse> {
    const { data } = await this.axios.post<WebRtcAnswerResponse>(`/replies/speech/realtime`, request);
    return data;
  }

  async getTranscriptionEphemeralToken(
    inputAudioFormat: string,
    language: Language,
  ): Promise<TranscriptionSessionCreateResponse> {
    const body: GetRealtimeTranscriptionParams = {
      input_audio_format: inputAudioFormat,
      language: language,
    };

    const { data } = await this.axios.post<TranscriptionSessionCreateResponse>(
      '/replies/transcription/realtime',
      body,
    );

    return data;
  }

  async getApiKeysStatus(): Promise<ApiKeysStatus> {
    const { data } = await this.axios.get<ApiKeysStatus>(`/replies/api-keys/status`);
    return data;
  }

  async registerUser(request: RegisterUserBody): Promise<AuthResponse | string> {
    try {
      const { data } = await this.axios.post<AuthResponse>(`/auth/register`, request);
      return data;
    } catch (err) {
      console.error('Error registering user:', err);
      return 'Error registering user';
    }
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

  private pcmArrayBufferToBlob(buf: ArrayBuffer, format: string = 'pcm'): Blob {
    return new Blob([buf], { type: `audio/${format}` });
  }
}

// Export a singleton instance for convenience
export const apiClient = new FigurantApiClient();
