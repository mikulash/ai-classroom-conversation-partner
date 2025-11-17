import {
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechRequest,
  TextToSpeechTimestampedRequest,
} from '@repo/shared/types/figurantClient.types';
import { Language } from '@repo/shared/enums/Language';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { Personality, Scenario } from '../generated/prisma/client';
import { Profile } from '@repo/shared/types/db/entities';

type WithModelName<T, Extra extends object = object> = T & { modelApiName: string } & Extra;

export interface GetResponseParams {
    inputText: string;
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

export type GetTTSAudioParamsWithModelName = WithModelName<TextToSpeechRequest, { sampleRate: number }>;

export type GetResponseParamsWithModelName = WithModelName<GetResponseParams>;

export type GetTimestampedTranscriptionParamsWithModelName = WithModelName<GetTimestampedTranscriptionParams>;

export type GetRealtimeTranscriptionParamsWithModelName = WithModelName<RealtimeTranscriptionRequest>;

export type GetRealtimeVoiceParamsWithModelName = WithModelName<RealtimeVoiceRequest>;

export type GetTimestampedAudioParamsWithModelName = WithModelName<TextToSpeechTimestampedRequest, { sampleRate: number}>;
