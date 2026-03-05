import {
  AppConfigDto,
  AuthProfileResponseDto,
  ConversationRoleDto,
  ConversationWithPersonalityResponseDto,
  CustomSelectionWithModelsDto,
  PersonalityDto, RealtimeModelDto, RealtimeTranscriptionModelDto,
  ProfileResponseDto,
  ResponseModelDto,
  ScenarioWithPersonalityDto, TimestampedTranscriptionModelDto, TtsModelDto,
} from './clients/generated';
import {
  AppConfigModel,
  ConversationModel,
  ConversationRoleModel,
  CustomSelectionWithModelsModel,
  PersonalityModel, ProfileModel, RealtimeModelModel, RealtimeTranscriptionModelModel,
  ResponseModelModel,
  ScenarioModel, TimestampedTranscriptionModelModel,
  TtsModelModel,
} from './models';

function stringToDate(dateStr: string): Date;
function stringToDate(dateStr: string | null): Date | null;
function stringToDate(dateStr: string | null): Date | null {
  return dateStr ? new Date(dateStr) : null;
}

export function scenarioWithPersonalityDtoToModel(
  dto: ScenarioWithPersonalityDto,
): ScenarioModel & { personality: { id: number; name: string; avatarUrl: string | null } | null } {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    involvedPersonalityId: dto.involvedPersonalityId,
    situationDescriptionEn: dto.situationDescriptionEn,
    settingEn: dto.settingEn,
    situationDescriptionCs: dto.situationDescriptionCs,
    settingCs: dto.settingCs,
    personality: dto.personality,
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


// ============================================================
// Model Mappers
// ============================================================

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
    isEnabled: dto.isEnabled ?? false,
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
    realtimeTranscriptionModel: dto.realtimeTranscriptionModel ? realtimeTranscriptionModelDtoToModel(dto.realtimeTranscriptionModel) : null,
    timestampedTranscriptionModel: dto.timestampedTranscriptionModel ? timestampedTranscriptionModelDtoToModel(dto.timestampedTranscriptionModel) : null,
  };
}

export function profileDtoToModel(dto: ProfileResponseDto | AuthProfileResponseDto): ProfileModel {
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

export function conversationDtoToModel(dto: ConversationWithPersonalityResponseDto): ConversationModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    userId: dto.userId,
    personalityId: dto.personalityId ?? null,
    scenarioId: dto.scenarioId ?? null,
    startTime: stringToDate(dto.startTime),
    endTime: stringToDate(dto.endTime),
    endedReason: dto.endedReason,
    messages: (dto.messages) ?? null,
    logs: (dto.logs) ?? null,
    conversationType: dto.conversationType,
    personality: dto.personality ? { id: dto.personality.id, name: dto.personality.name, avatarUrl: dto.personality.avatarUrl } : null,
    scenario: dto.scenario ? { id: dto.scenario.id, situationDescriptionEn: dto.scenario.situationDescriptionEn, situationDescriptionCs: dto.scenario.situationDescriptionCs } : null,
  };
}

