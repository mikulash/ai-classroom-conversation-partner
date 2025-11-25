import type {
  AppConfigDto,
  ConversationDto,
  ConversationRoleDto,
  ConversationWithPersonalityDto,
  CustomSelectionWithModelsDto,
  PersonalityDto,
  PersonalityWithScenariosDto,
  ProfileDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  ResponseModelDto,
  ScenarioDto,
  ScenarioWithPersonalityDto,
  TimestampedTranscriptionModelDto,
  TtsModelDto,
} from '../types/db/dto';
import type {
  AdminUserCustomModelSelection,
  AppConfig,
  Conversation,
  ConversationRole,
  Personality,
  Profile,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  Scenario,
  TimestampedTranscriptionModel,
  TtsModel,
} from '../types/db/entities';

// ============================================================
// Helper Functions
// ============================================================

function stringToDate(dateStr: string): Date;
function stringToDate(dateStr: string | null): Date | null;
function stringToDate(dateStr: string | null): Date | null {
  return dateStr ? new Date(dateStr) : null;
}

// ============================================================
// Profile Mappers
// ============================================================

export function profileDtoToEntity(dto: ProfileDto): Profile & { email: string; confirmedAt: Date | null } {
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
    confirmedAt: stringToDate(dto.confirmedAt),
  };
}

// ============================================================
// Conversation Mappers
// ============================================================

export function conversationDtoToEntity(dto: ConversationDto): Conversation {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    userId: dto.userId,
    personalityId: dto.personalityId,
    scenarioId: dto.scenarioId,
    startTime: stringToDate(dto.startTime),
    endTime: stringToDate(dto.endTime),
    endedReason: dto.endedReason,
    messages: dto.messages,
    logs: dto.logs,
    conversationType: dto.conversationType,
  };
}

export function conversationWithPersonalityDtoToEntity(
  dto: ConversationWithPersonalityDto,
): Conversation & {
    personality: { id: number; name: string; avatarUrl: string | null } | null;
    scenario?: { id: number; situationDescriptionEn: string; situationDescriptionCs: string } | null;
} {
  return {
    ...conversationDtoToEntity(dto),
    personality: dto.personality,
    scenario: dto.scenario,
  };
}

// ============================================================
// Personality Mappers
// ============================================================

export function personalityDtoToEntity(dto: PersonalityDto): Personality {
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

export function personalityWithScenariosDtoToEntity(
  dto: PersonalityWithScenariosDto,
): Personality & { scenarios: Scenario[] } {
  return {
    ...personalityDtoToEntity(dto),
    scenarios: dto.scenarios.map(scenarioDtoToEntity),
  };
}

// ============================================================
// Scenario Mappers
// ============================================================

export function scenarioDtoToEntity(dto: ScenarioDto): Scenario {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    involvedPersonalityId: dto.involvedPersonalityId,
    situationDescriptionEn: dto.situationDescriptionEn,
    settingEn: dto.settingEn,
    situationDescriptionCs: dto.situationDescriptionCs,
    settingCs: dto.settingCs,
  };
}

export function scenarioWithPersonalityDtoToEntity(
  dto: ScenarioWithPersonalityDto,
): Scenario & { personality: { id: number; name: string; avatarUrl: string | null } | null } {
  return {
    ...scenarioDtoToEntity(dto),
    personality: dto.personality,
  };
}

// ============================================================
// Conversation Role Mappers
// ============================================================

export function conversationRoleDtoToEntity(dto: ConversationRoleDto): ConversationRole {
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

export function responseModelDtoToEntity(dto: ResponseModelDto): ResponseModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl,
    isEnabled: dto.isEnabled,
    provider: dto.provider,
  };
}

export function ttsModelDtoToEntity(dto: TtsModelDto): TtsModel {
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

export function realtimeModelDtoToEntity(dto: RealtimeModelDto): RealtimeModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl,
    isEnabled: dto.isEnabled,
    provider: dto.provider,
  };
}

export function realtimeTranscriptionModelDtoToEntity(
  dto: RealtimeTranscriptionModelDto,
): RealtimeTranscriptionModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    provider: dto.provider,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl,
    isEnabled: dto.isEnabled,
    allowsWordLevelTimestamps: dto.allowsWordLevelTimestamps,
  };
}

export function timestampedTranscriptionModelDtoToEntity(
  dto: TimestampedTranscriptionModelDto,
): TimestampedTranscriptionModel {
  return {
    id: dto.id,
    createdAt: stringToDate(dto.createdAt),
    friendlyName: dto.friendlyName,
    provider: dto.provider,
    apiName: dto.apiName,
    docsUrl: dto.docsUrl,
    isEnabled: dto.isEnabled,
  };
}

// ============================================================
// App Config Mappers
// ============================================================

export function appConfigDtoToEntity(dto: AppConfigDto): AppConfig {
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

export function customSelectionWithModelsDtoToEntity(
  dto: CustomSelectionWithModelsDto,
): AdminUserCustomModelSelection & {
    responseModel: ResponseModel | null;
    ttsModel: TtsModel | null;
    realtimeModel: RealtimeModel | null;
    realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
    timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
} {
  return {
    userId: dto.userId,
    createdAt: stringToDate(dto.createdAt),
    responseModelId: dto.responseModelId,
    ttsModelId: dto.ttsModelId,
    realtimeModelId: dto.realtimeModelId,
    realtimeTranscriptionModelId: dto.realtimeTranscriptionModelId,
    timestampedTranscriptionModelId: dto.timestampedTranscriptionModelId,
    responseModel: dto.responseModel ? responseModelDtoToEntity(dto.responseModel) : null,
    ttsModel: dto.ttsModel ? ttsModelDtoToEntity(dto.ttsModel) : null,
    realtimeModel: dto.realtimeModel ? realtimeModelDtoToEntity(dto.realtimeModel) : null,
    realtimeTranscriptionModel: dto.realtimeTranscriptionModel ?
      realtimeTranscriptionModelDtoToEntity(dto.realtimeTranscriptionModel) :
      null,
    timestampedTranscriptionModel: dto.timestampedTranscriptionModel ?
      timestampedTranscriptionModelDtoToEntity(dto.timestampedTranscriptionModel) :
      null,
  };
}
