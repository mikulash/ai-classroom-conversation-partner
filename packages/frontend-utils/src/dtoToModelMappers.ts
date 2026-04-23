import {
  AiProviderStatusDto,
  AppConfigDto,
  AuthEmailVerificationResponseDto,
  AuthLoginResponseDto,
  AuthTokensResponseDto,
  ClientSecretDto,
  ConversationLogDto,
  ConversationMessageDto,
  ConversationRoleDto,
  ConversationScenarioRefDto,
  ConversationWithPersonalityDto,
  CustomSelectionWithModelsDto,
  FullReplyPlainResponseDto,
  InputAudioTranscriptionDto,
  MessageResponseDto,
  PersonalityDto,
  PersonalityRefDto,
  ProfileDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  ResponseModelDto,
  ScenarioWithPersonalityDto,
  TextToSpeechResponseDto,
  TimestampedTranscriptionModelDto,
  TranscriptionSessionCreateResponseDto,
  TurnDetectionDto,
  TtsModelDto,
  WebRtcAnswerResponseDto,
} from './clients/generated';
import {
  AiProviderStatusModel,
  AppConfigModel,
  AuthenticatedUserModel,
  AuthTokensModel,
  ClientSecretModel,
  ConversationLogModel,
  ConversationMessageModel,
  ConversationModel,
  ConversationRoleModel,
  CustomSelectionWithModelsModel,
  FullReplyPlainModel,
  InputAudioTranscriptionModel,
  MessageModel,
  PersonalityModel,
  PersonalityRefModel,
  ProfileModel,
  RealtimeModelModel,
  RealtimeTranscriptionModelModel,
  ResponseModelModel,
  ScenarioRefModel,
  ScenarioWithPersonalityModel,
  SpeechAudioModel,
  TimestampedTranscriptionModelModel,
  TranscriptionSessionModel,
  TurnDetectionModel,
  TtsModelModel,
  WebRtcAnswerModel,
} from './models';

function stringToDate(dateStr: string): Date;
function stringToDate(dateStr: string | null): Date | null;
function stringToDate(dateStr: string | null): Date | null {
  return dateStr ? new Date(dateStr) : null;
}

function b64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const length = binary.length;
  const buffer = new ArrayBuffer(length);
  const view = new Uint8Array(buffer);

  for (let index = 0; index < length; index += 1) {
    view[index] = binary.charCodeAt(index);
  }

  return buffer;
}

function arrayBufferToAudioBlob(buffer: ArrayBuffer, format: 'pcm' | 'mp3' = 'pcm'): Blob {
  return new Blob([buffer], { type: `audio/${format}` });
}

export function messageDtoToModel(dto: MessageResponseDto): MessageModel {
  return {
    message: dto.message,
  };
}

export function personalityRefDtoToModel(dto: PersonalityRefDto): PersonalityRefModel {
  return {
    id: dto.id,
    name: dto.name,
    avatarUrl: dto.avatarUrl ?? null,
  };
}

export function scenarioRefDtoToModel(dto: ConversationScenarioRefDto): ScenarioRefModel {
  return {
    id: dto.id,
    situationDescriptionEn: dto.situationDescriptionEn,
    situationDescriptionCs: dto.situationDescriptionCs,
  };
}

export function conversationMessageDtoToModel(dto: ConversationMessageDto): ConversationMessageModel {
  return {
    role: dto.role,
    content: dto.content,
    timestamp: stringToDate(dto.timestamp),
  };
}

export function conversationLogDtoToModel(dto: ConversationLogDto): ConversationLogModel {
  return {
    timestamp: stringToDate(dto.timestamp),
    level: dto.level,
    message: dto.message,
    data: dto.data ?? null,
  };
}

export function scenarioWithPersonalityDtoToModel(
  dto: ScenarioWithPersonalityDto,
): ScenarioWithPersonalityModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    involvedPersonalityId: dto.involvedPersonalityId,
    situationDescriptionEn: dto.situationDescriptionEn,
    settingEn: dto.settingEn,
    situationDescriptionCs: dto.situationDescriptionCs,
    settingCs: dto.settingCs,
    personality: dto.personality ? personalityRefDtoToModel(dto.personality) : null,
  };
}

export function personalityDtoToModel(dto: PersonalityDto): PersonalityModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    name: dto.name,
    age: dto.age,
    avatarUrl: dto.avatarUrl,
    gender: dto.gender,
    sex: dto.sex,
    voiceInstructions: dto.voiceInstructions,
    elevenlabsVoiceId: dto.elevenlabsVoiceId,
    openaiVoiceName: dto.openaiVoiceName,
    problemSummaryEn: dto.problemSummaryEn,
    personalityDescriptionEn: dto.personalityDescriptionEn,
    problemSummaryCs: dto.problemSummaryCs,
    personalityDescriptionCs: dto.personalityDescriptionCs,
    isHidden: dto.isHidden,
  };
}

export function appConfigDtoToModel(dto: AppConfigDto): AppConfigModel {
  return {
    id: dto.id,
    validFrom: stringToDate(dto.validFrom),
    validTo: stringToDate(dto.validTo),
    userId: dto.userId,
    responseModelId: dto.responseModelId,
    ttsModelId: dto.ttsModelId,
    realtimeModelId: dto.realtimeModelId,
    silenceTimeoutInSeconds: dto.silenceTimeoutInSeconds,
    allowedDomains: dto.allowedDomains,
    appName: dto.appName,
    realtimeTranscriptionModelId: dto.realtimeTranscriptionModelId,
    timestampedTranscriptionModelId: dto.timestampedTranscriptionModelId,
    maxConversationDurationInSeconds: dto.maxConversationDurationInSeconds,
  };
}

export function conversationRoleDtoToModel(dto: ConversationRoleDto): ConversationRoleModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    nameEn: dto.nameEn,
    nameCs: dto.nameCs,
  };
}

export function responseModelDtoToModel(dto: ResponseModelDto): ResponseModelModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl ?? null,
    isEnabled: dto.isEnabled,
    provider: dto.provider,
  };
}

export function ttsModelDtoToModel(dto: TtsModelDto): TtsModelModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    apiName: dto.apiName,
    sampleRate: dto.sampleRate,
    docsUrl: dto.docsUrl,
    isEnabled: dto.isEnabled,
    provider: dto.provider,
    allowsWordLevelTimestampedTranscript: dto.allowsWordLevelTimestampedTranscript,
  };
}

export function realtimeModelDtoToModel(dto: RealtimeModelDto): RealtimeModelModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl ?? null,
    isEnabled: dto.isEnabled,
    provider: dto.provider,
  };
}

export function realtimeTranscriptionModelDtoToModel(
  dto: RealtimeTranscriptionModelDto,
): RealtimeTranscriptionModelModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    provider: dto.provider,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl ?? null,
    isEnabled: dto.isEnabled ?? null,
    allowsWordLevelTimestamps: dto.allowsWordLevelTimestamps,
  };
}

export function timestampedTranscriptionModelDtoToModel(
  dto: TimestampedTranscriptionModelDto,
): TimestampedTranscriptionModelModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    provider: dto.provider,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl ?? null,
    isEnabled: dto.isEnabled,
  };
}

export function customSelectionWithModelsDtoToModel(dto: CustomSelectionWithModelsDto): CustomSelectionWithModelsModel {
  return {
    userId: dto.userId,
    createdAt: stringToDate(dto.createdAt),
    responseModelId: dto.responseModelId ?? null,
    ttsModelId: dto.ttsModelId ?? null,
    realtimeModelId: dto.realtimeModelId ?? null,
    realtimeTranscriptionModelId: dto.realtimeTranscriptionModelId ?? null,
    timestampedTranscriptionModelId: dto.timestampedTranscriptionModelId ?? null,
    responseModel: dto.responseModel ? responseModelDtoToModel(dto.responseModel) : null,
    ttsModel: dto.ttsModel ? ttsModelDtoToModel(dto.ttsModel) : null,
    realtimeModel: dto.realtimeModel ? realtimeModelDtoToModel(dto.realtimeModel) : null,
    realtimeTranscriptionModel: dto.realtimeTranscriptionModel ?
      realtimeTranscriptionModelDtoToModel(dto.realtimeTranscriptionModel) :
      null,
    timestampedTranscriptionModel: dto.timestampedTranscriptionModel ?
      timestampedTranscriptionModelDtoToModel(dto.timestampedTranscriptionModel) :
      null,
  };
}

export function profileDtoToModel(dto: ProfileDto): ProfileModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    updatedAt: stringToDate(dto.updatedAt),
    fullName: dto.fullName,
    gender: dto.gender,
    userRole: dto.userRole,
    conversationRole: dto.conversationRole,
    bio: dto.bio,
    email: dto.email,
    confirmedAt: stringToDate(dto.confirmedAt ?? null),
  };
}

export function conversationDtoToModel(dto: ConversationWithPersonalityDto): ConversationModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    userId: dto.userId,
    personalityId: dto.personalityId ?? null,
    scenarioId: dto.scenarioId ?? null,
    startTime: stringToDate(dto.startTime),
    endTime: stringToDate(dto.endTime),
    endedReason: dto.endedReason,
    messages: dto.messages?.map(conversationMessageDtoToModel) ?? null,
    logs: dto.logs?.map(conversationLogDtoToModel) ?? null,
    conversationType: dto.conversationType,
    personality: dto.personality ? personalityRefDtoToModel(dto.personality) : null,
    scenario: dto.scenario ? scenarioRefDtoToModel(dto.scenario) : null,
  };
}

export function authResponseDtoToModel(
  dto: AuthEmailVerificationResponseDto | AuthLoginResponseDto,
): AuthenticatedUserModel {
  const user = profileDtoToModel(dto.user);

  return {
    user,
    session: {
      access_token: dto.accessToken,
      user,
    },
  };
}

export function authTokensDtoToModel(dto: AuthTokensResponseDto): AuthTokensModel {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
  };
}

export function speechAudioDtoToModel(
  dto: TextToSpeechResponseDto,
  format: 'pcm' | 'mp3' = 'pcm',
): SpeechAudioModel {
  const buffer = b64ToArrayBuffer(dto.audioBase64);
  const blob = arrayBufferToAudioBlob(buffer, format);

  return {
    blob,
    objectUrl: URL.createObjectURL(blob),
    buffer,
    sampleRate: dto.sampleRate,
  };
}

export function fullReplyPlainResponseDtoToModel(dto: FullReplyPlainResponseDto): FullReplyPlainModel {
  return {
    text: dto.text,
    speech: speechAudioDtoToModel(dto.speech),
  };
}

export function webRtcAnswerDtoToModel(dto: WebRtcAnswerResponseDto): WebRtcAnswerModel {
  return {
    sdp: dto.sdp,
  };
}

export function turnDetectionDtoToModel(dto: TurnDetectionDto): TurnDetectionModel {
  return {
    type: dto.type,
    threshold: dto.threshold,
    prefix_padding_ms: dto.prefix_padding_ms,
    silence_duration_ms: dto.silence_duration_ms,
  };
}

export function inputAudioTranscriptionDtoToModel(
  dto: InputAudioTranscriptionDto,
): InputAudioTranscriptionModel {
  return {
    model: dto.model,
    language: dto.language ?? null,
    prompt: dto.prompt,
  };
}

export function clientSecretDtoToModel(dto: ClientSecretDto): ClientSecretModel {
  return {
    expires_at: dto.expires_at,
    value: dto.value,
  };
}

export function transcriptionSessionDtoToModel(
  dto: TranscriptionSessionCreateResponseDto,
): TranscriptionSessionModel {
  return {
    id: dto.id,
    object: dto.object,
    modalities: dto.modalities,
    turn_detection: turnDetectionDtoToModel(dto.turn_detection),
    input_audio_format: dto.input_audio_format,
    input_audio_transcription: inputAudioTranscriptionDtoToModel(dto.input_audio_transcription),
    client_secret: dto.client_secret ? clientSecretDtoToModel(dto.client_secret) : null,
    expires_at: dto.expires_at,
  };
}

export function aiProviderStatusDtoToModel(dto: AiProviderStatusDto): AiProviderStatusModel {
  return {
    apiKey: dto.apiKey,
    isAvailable: dto.isAvailable,
  };
}
