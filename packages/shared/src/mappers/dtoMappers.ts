
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

// ============================================================
// Helper Functions
// ============================================================
function dateToString(date: Date): string {
  return date.toISOString();
}

function dateToStringOrNull(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

// ============================================================
// Profile Mappers
// ============================================================

export function profileToDto(
  profile: Profile & { email: string; confirmedAt: Date | null },
): ProfileDto {
  return {
    id: profile.id,
    createdAt: dateToString(profile.createdAt),
    updatedAt: dateToString(profile.updatedAt),
    fullName: profile.fullName,
    gender: profile.gender,
    userRole: profile.userRole,
    conversationRole: profile.conversationRole,
    bio: profile.bio,
    email: profile.email,
    confirmedAt: dateToStringOrNull(profile.confirmedAt),
  };
}

// ============================================================
// Conversation Mappers
// ============================================================

export function conversationToDto(conversation: Conversation): ConversationDto {
  return {
    id: conversation.id,
    createdAt: dateToString(conversation.createdAt),
    userId: conversation.userId,
    personalityId: conversation.personalityId,
    scenarioId: conversation.scenarioId,
    startTime: dateToString(conversation.startTime),
    endTime: dateToString(conversation.endTime),
    endedReason: conversation.endedReason,
    messages: conversation.messages,
    logs: conversation.logs,
    conversationType: conversation.conversationType,
  };
}

export function conversationWithPersonalityToDto(
  conversation: Conversation & {
    personality: { id: number; name: string; avatarUrl: string | null } | null;
    scenario?: { id: number; situationDescriptionEn: string; situationDescriptionCs: string } | null;
  },
): ConversationWithPersonalityDto {
  return {
    ...conversationToDto(conversation),
    personality: conversation.personality,
    scenario: conversation.scenario,
  };
}

// ============================================================
// Personality Mappers
// ============================================================

export function personalityToDto(personality: Personality): PersonalityDto {
  return {
    id: personality.id,
    createdAt: dateToString(personality.createdAt),
    name: personality.name,
    age: personality.age,
    avatarUrl: personality.avatarUrl,
    gender: personality.gender,
    sex: personality.sex,
    voiceInstructions: personality.voiceInstructions,
    elevenlabsVoiceId: personality.elevenlabsVoiceId,
    openaiVoiceName: personality.openaiVoiceName,
    problemSummaryEn: personality.problemSummaryEn,
    personalityDescriptionEn: personality.personalityDescriptionEn,
    problemSummaryCs: personality.problemSummaryCs,
    personalityDescriptionCs: personality.personalityDescriptionCs,
    isHidden: personality.isHidden,
  };
}

export function personalityWithScenariosToDto(
  personality: Personality & { scenarios: Scenario[] },
): PersonalityWithScenariosDto {
  return {
    ...personalityToDto(personality),
    scenarios: personality.scenarios.map(scenarioToDto),
  };
}

// ============================================================
// Scenario Mappers
// ============================================================

export function scenarioToDto(scenario: Scenario): ScenarioDto {
  return {
    id: scenario.id,
    createdAt: dateToString(scenario.createdAt),
    involvedPersonalityId: scenario.involvedPersonalityId,
    situationDescriptionEn: scenario.situationDescriptionEn,
    settingEn: scenario.settingEn,
    situationDescriptionCs: scenario.situationDescriptionCs,
    settingCs: scenario.settingCs,
  };
}

export function scenarioWithPersonalityToDto(
  scenario: Scenario & { personality: { id: number; name: string; avatarUrl: string | null } | null },
): ScenarioWithPersonalityDto {
  return {
    ...scenarioToDto(scenario),
    personality: scenario.personality,
  };
}

// ============================================================
// Conversation Role Mappers
// ============================================================

export function conversationRoleToDto(role: ConversationRole): ConversationRoleDto {
  return {
    id: role.id,
    createdAt: dateToString(role.createdAt),
    nameEn: role.nameEn,
    nameCs: role.nameCs,
  };
}

// ============================================================
// Model Mappers
// ============================================================

export function responseModelToDto(model: ResponseModel): ResponseModelDto {
  return {
    id: model.id,
    createdAt: dateToString(model.createdAt),
    friendlyName: model.friendlyName,
    apiName: model.apiName,
    docsUrl: model.docsUrl,
    isEnabled: model.isEnabled,
    provider: model.provider,
  };
}

export function ttsModelToDto(model: TtsModel): TtsModelDto {
  return {
    id: model.id,
    createdAt: dateToString(model.createdAt),
    friendlyName: model.friendlyName,
    apiName: model.apiName,
    sampleRate: model.sampleRate,
    docsUrl: model.docsUrl,
    isEnabled: model.isEnabled,
    provider: model.provider,
    allowsWordLevelTimestampedTranscript: model.allowsWordLevelTimestampedTranscript,
  };
}

export function realtimeModelToDto(model: RealtimeModel): RealtimeModelDto {
  return {
    id: model.id,
    createdAt: dateToString(model.createdAt),
    friendlyName: model.friendlyName,
    apiName: model.apiName,
    docsUrl: model.docsUrl,
    isEnabled: model.isEnabled,
    provider: model.provider,
  };
}

export function realtimeTranscriptionModelToDto(
  model: RealtimeTranscriptionModel,
): RealtimeTranscriptionModelDto {
  return {
    id: model.id,
    createdAt: dateToString(model.createdAt),
    friendlyName: model.friendlyName,
    provider: model.provider,
    apiName: model.apiName,
    docsUrl: model.docsUrl,
    isEnabled: model.isEnabled,
    allowsWordLevelTimestamps: model.allowsWordLevelTimestamps,
  };
}

export function timestampedTranscriptionModelToDto(
  model: TimestampedTranscriptionModel,
): TimestampedTranscriptionModelDto {
  return {
    id: model.id,
    createdAt: dateToString(model.createdAt),
    friendlyName: model.friendlyName,
    provider: model.provider,
    apiName: model.apiName,
    docsUrl: model.docsUrl,
    isEnabled: model.isEnabled,
  };
}

// ============================================================
// App Config Mappers
// ============================================================

export function appConfigToDto(config: AppConfig): AppConfigDto {
  return {
    id: config.id,
    validFrom: dateToString(config.validFrom),
    validTo: dateToStringOrNull(config.validTo),
    userId: config.userId,
    responseModelId: config.responseModelId,
    ttsModelId: config.ttsModelId,
    realtimeModelId: config.realtimeModelId,
    silenceTimeoutInSeconds: config.silenceTimeoutInSeconds,
    allowedDomains: config.allowedDomains,
    appName: config.appName,
    realtimeTranscriptionModelId: config.realtimeTranscriptionModelId,
    timestampedTranscriptionModelId: config.timestampedTranscriptionModelId,
    maxConversationDurationInSeconds: config.maxConversationDurationInSeconds,
  };
}

export function customSelectionWithModelsToDto(
  selection: AdminUserCustomModelSelection & {
    responseModel: ResponseModel | null;
    ttsModel: TtsModel | null;
    realtimeModel: RealtimeModel | null;
    realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
    timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
  },
): CustomSelectionWithModelsDto {
  return {
    userId: selection.userId,
    createdAt: dateToString(selection.createdAt),
    responseModelId: selection.responseModelId,
    ttsModelId: selection.ttsModelId,
    realtimeModelId: selection.realtimeModelId,
    realtimeTranscriptionModelId: selection.realtimeTranscriptionModelId,
    timestampedTranscriptionModelId: selection.timestampedTranscriptionModelId,
    responseModel: selection.responseModel ? responseModelToDto(selection.responseModel) : null,
    ttsModel: selection.ttsModel ? ttsModelToDto(selection.ttsModel) : null,
    realtimeModel: selection.realtimeModel ? realtimeModelToDto(selection.realtimeModel) : null,
    realtimeTranscriptionModel: selection.realtimeTranscriptionModel ?
      realtimeTranscriptionModelToDto(selection.realtimeTranscriptionModel) :
      null,
    timestampedTranscriptionModel: selection.timestampedTranscriptionModel ?
      timestampedTranscriptionModelToDto(selection.timestampedTranscriptionModel) :
      null,
  };
}
