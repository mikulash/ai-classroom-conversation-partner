import { OpenAiVoiceName } from '@repo/shared/types/generated/enums';
import { ConversationMessageDto } from '../dtos/conversations.dto';
import { LanguageDto, ReplyPersonalityDto, ReplyProfileDto, ReplyScenarioDto } from '../dtos/replies.dto';

type WithModelName<T, Extra extends object = {}> = T & { modelApiName: string } & Extra;

export interface GetResponseParams {
  inputText: string;
  previousMessages: ConversationMessageDto[];
  personality: ReplyPersonalityDto;
  conversationRole: string;
  language: LanguageDto;
  scenario: ReplyScenarioDto | null;
  userProfile: ReplyProfileDto;
}

export interface GetSpeechAudioParams {
  inputMessage: string;
  personality: ReplyPersonalityDto;
  language: LanguageDto;
  responseFormat: 'pcm' | 'mp3';
}

export interface GetTimestampedSpeechAudioParams {
  inputMessage: string;
  personality: ReplyPersonalityDto;
  language: LanguageDto;
}

export interface GetRealtimeTranscriptionParams {
  inputAudioFormat: string;
  language: LanguageDto;
}

export interface GetRealtimeVoiceParams {
  openaiVoiceName: OpenAiVoiceName;
  personality: ReplyPersonalityDto;
  conversationRole: string;
  language: LanguageDto;
  scenario: ReplyScenarioDto | null;
  userProfile: ReplyProfileDto;
  sdpOffer: string;
}

export interface GetTimestampedTranscriptionParams {
  audioFile: File;
  language: LanguageDto;
}

export interface SpeechAudioResult {
  buffer: ArrayBuffer;
  sampleRate: number;
}

export type GetTTSAudioParamsWithModelName = WithModelName<GetSpeechAudioParams, { sampleRate: number }>;

export type GetResponseParamsWithModelName = WithModelName<GetResponseParams>;

export type GetTimestampedTranscriptionParamsWithModelName = WithModelName<GetTimestampedTranscriptionParams>;

export type GetRealtimeTranscriptionParamsWithModelName = WithModelName<GetRealtimeTranscriptionParams>;

export type GetRealtimeVoiceParamsWithModelName = WithModelName<GetRealtimeVoiceParams>;

export type GetTimestampedAudioParamsWithModelName = WithModelName<
  GetTimestampedSpeechAudioParams,
  { sampleRate: number }
>;
