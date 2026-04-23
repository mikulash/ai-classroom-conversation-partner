import {
  ConversationMessageDto,
  FullReplyTimestampedResponseDto,
  GenerateReplyDto,
  LanguageDto,
  ReplyPersonalityDto,
  ReplyProfileDto,
  ReplyScenarioDto,
  RepliesApiFp,
  RealtimeTranscriptionDto,
  RealtimeVoiceDto,
  TextToSpeechDto,
  TextToSpeechTimestampedDto,
  TextToSpeechTimestampedResponseDto,
} from './generated';
import {
  GenerateReplyRequest,
  RealtimeTranscriptionRequest,
  RealtimeVoiceRequest,
  TextToSpeechRequest,
  TextToSpeechTimestampedRequest,
} from '../figurantClient.types';
import {
  aiProviderStatusDtoToModel,
  fullReplyPlainResponseDtoToModel,
  speechAudioDtoToModel,
  transcriptionSessionDtoToModel,
  webRtcAnswerDtoToModel,
} from '../dtoToModelMappers';
import {
  AiProviderStatusModel,
  FullReplyPlainModel,
  SpeechAudioModel,
  TranscriptionSessionModel,
  WebRtcAnswerModel,
} from '../models';
import { api } from './api';

const repliesApi = RepliesApiFp();

function toLanguageDto(language: GenerateReplyRequest['language']): LanguageDto {
  return {
    BCP47: language.BCP47,
    ISO639: language.ISO639,
    ENGLISH_NAME: language.ENGLISH_NAME,
    NATIVE_NAME: language.NATIVE_NAME,
  };
}

function toReplyPersonalityDto(personality: GenerateReplyRequest['personality']): ReplyPersonalityDto {
  return {
    id: personality.id,
    name: personality.name,
    age: personality.age,
    sex: personality.sex,
    gender: personality.gender,
    openaiVoiceName: personality.openaiVoiceName,
    elevenlabsVoiceId: personality.elevenlabsVoiceId,
    voiceInstructions: personality.voiceInstructions,
    personalityDescriptionEn: personality.personalityDescriptionEn,
    personalityDescriptionCs: personality.personalityDescriptionCs,
    problemSummaryEn: personality.problemSummaryEn,
    problemSummaryCs: personality.problemSummaryCs,
    avatarUrl: personality.avatarUrl,
    isHidden: personality.isHidden,
  };
}

function toReplyScenarioDto(scenario: GenerateReplyRequest['scenario']): ReplyScenarioDto | null {
  if (!scenario) {
    return null;
  }

  return {
    id: scenario.id,
    involvedPersonalityId: scenario.involvedPersonalityId ?? undefined,
    settingEn: scenario.settingEn,
    settingCs: scenario.settingCs,
    situationDescriptionEn: scenario.situationDescriptionEn,
    situationDescriptionCs: scenario.situationDescriptionCs,
  };
}

function toReplyProfileDto(profile: GenerateReplyRequest['userProfile']): ReplyProfileDto {
  return {
    id: profile.id,
    fullName: profile.fullName,
    gender: profile.gender,
    conversationRole: profile.conversationRole,
    bio: profile.bio,
    email: profile.email,
    userRole: profile.userRole,
  };
}

function toConversationMessageDto(message: GenerateReplyRequest['previousMessages'][number]): ConversationMessageDto {
  return {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp?.toISOString() ?? new Date().toISOString(),
  };
}

function toGenerateReplyDto(request: GenerateReplyRequest): GenerateReplyDto {
  return {
    inputText: request.inputText,
    previousMessages: request.previousMessages.map(toConversationMessageDto),
    personality: toReplyPersonalityDto(request.personality),
    conversationRole: request.conversationRole,
    language: toLanguageDto(request.language),
    scenario: toReplyScenarioDto(request.scenario),
    userProfile: toReplyProfileDto(request.userProfile),
  };
}

function toTextToSpeechDto(params: TextToSpeechRequest): TextToSpeechDto {
  return {
    inputMessage: params.inputMessage,
    personality: toReplyPersonalityDto(params.personality),
    language: toLanguageDto(params.language),
    responseFormat: params.responseFormat,
  };
}

function toTextToSpeechTimestampedDto(params: TextToSpeechTimestampedRequest): TextToSpeechTimestampedDto {
  return {
    inputMessage: params.inputMessage,
    personality: toReplyPersonalityDto(params.personality),
    language: toLanguageDto(params.language),
  };
}

function toRealtimeVoiceDto(request: RealtimeVoiceRequest): RealtimeVoiceDto {
  return {
    sdpOffer: request.sdp_offer,
    personality: toReplyPersonalityDto(request.personality),
    conversationRole: request.conversationRole,
    language: toLanguageDto(request.language),
    scenario: toReplyScenarioDto(request.scenario),
    userProfile: toReplyProfileDto(request.userProfile),
  };
}

/**
 * Client for interacting with the Figurant backend API.
 * Uses the shared axios client from apiService for consistent auth handling.
 * Uses the generated RepliesApiFp internally; public signatures kept for backward compatibility.
 */
export class RepliesClient {
  async getResponse(request: GenerateReplyRequest): Promise<string> {
    const requestFn = await repliesApi.repliesControllerGenerateText(toGenerateReplyDto(request));
    const response = await requestFn(api);
    return response.data;
  }

  async getSpeechAudio(params: TextToSpeechRequest): Promise<SpeechAudioModel> {
    const requestFn = await repliesApi.repliesControllerGenerateSpeech(toTextToSpeechDto(params));
    const response = await requestFn(api);
    return speechAudioDtoToModel(response.data, params.responseFormat);
  }

  async getTimestampedSpeechAudio(params: TextToSpeechTimestampedRequest): Promise<TextToSpeechTimestampedResponseDto> {
    const requestFn = await repliesApi.repliesControllerGenerateTimestampedSpeech(toTextToSpeechTimestampedDto(params));
    const response = await requestFn(api);
    return response.data;
  }

  async getFullReplyPlain(request: GenerateReplyRequest): Promise<FullReplyPlainModel> {
    const requestFn = await repliesApi.repliesControllerGenerateFullPlain(toGenerateReplyDto(request));
    const response = await requestFn(api);
    return fullReplyPlainResponseDtoToModel(response.data);
  }

  async getFullReplyTimestamped(request: GenerateReplyRequest): Promise<FullReplyTimestampedResponseDto> {
    const requestFn = await repliesApi.repliesControllerGenerateFullTimestamped(toGenerateReplyDto(request));
    const response = await requestFn(api);
    return response.data;
  }

  async getWebRtcAnswer(request: RealtimeVoiceRequest): Promise<WebRtcAnswerModel> {
    const requestFn = await repliesApi.repliesControllerRealtimeVoice(toRealtimeVoiceDto(request));
    const response = await requestFn(api);
    return webRtcAnswerDtoToModel(response.data);
  }

  async getTranscriptionEphemeralToken(
    inputAudioFormat: string,
    language: RealtimeTranscriptionRequest['language'],
  ): Promise<TranscriptionSessionModel> {
    void inputAudioFormat;
    const body: RealtimeTranscriptionDto = {
      language,
    };

    const requestFn = await repliesApi.repliesControllerRealtimeTranscription(body);
    const response = await requestFn(api);
    return transcriptionSessionDtoToModel(response.data);
  }

  async getAiProvidersAvailability(): Promise<AiProviderStatusModel[]> {
    const requestFn = await repliesApi.repliesControllerGetProviders();
    const response = await requestFn(api);
    return response.data.map(aiProviderStatusDtoToModel);
  }
}

// Export a singleton instance for convenience
export const repliesClient = new RepliesClient();
