import {
  TextToSpeechRequest,
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechTimestampedRequest,
} from '@repo/shared/types/apiFigurantClient';
import { Language } from '@repo/shared/types/language';
import { Personality, Profile, Scenario } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { ChatMessage } from '@repo/shared/types/chatMessage';

type WithModelName<T, Extra extends object = object> = T & { model_api_name: string } & Extra;

export interface GetResponseParams {
    input_text: string;
    previousMessages: ChatMessage[];
    personality: Personality;
    conversationRole: string;
    language: Language;
    scenario: Scenario | null;
    userProfile: Profile
}

export interface GetTimestampedTranscriptionParams {
    audioFile: File;
    language: Language;
}

export type GetTTSAudioParamsWithModelName =
    WithModelName<TextToSpeechRequest, { sample_rate: number }>;

export type GetResponseParamsWithModelName = WithModelName<GetResponseParams>;

export type GetTimestampedTranscriptionParamsWithModelName = WithModelName<GetTimestampedTranscriptionParams>;

export type GetRealtimeTranscriptionParamsWithModelName = WithModelName<RealtimeTranscriptionRequest>;

export type GetRealtimeVoiceParamsWithModelName = WithModelName<RealtimeVoiceRequest>;

export type GetTimestampedAudioParamsWithModelName = WithModelName<TextToSpeechTimestampedRequest, { sample_rate: number }>;
