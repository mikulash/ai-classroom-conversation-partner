import {
  AppConfig,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel, TimestampedTranscriptionModel,
  TtsModel,
  Scenario,
  Personality, Profile,
  Conversation,
  ConversationRole,
  AdminUserCustomModelSelection,
} from '../generated/prisma/client';
import { AppConfigDto } from '../dtos/app-config.dto';
import {
  CustomSelectionWithModelsDto,
  RealtimeModelDto, RealtimeTranscriptionModelDto, ResponseModelDto,
  TimestampedTranscriptionModelDto, TtsModelDto,
} from '../dtos/models.dto';

import { ResponseModelModel } from '../generated/prisma/models/ResponseModel';
import { TtsModelModel } from '../generated/prisma/models/TtsModel';
import { RealtimeModelModel } from '../generated/prisma/models/RealtimeModel';
import { RealtimeTranscriptionModelModel } from '../generated/prisma/models/RealtimeTranscriptionModel';
import { TimestampedTranscriptionModelModel } from '../generated/prisma/models/TimestampedTranscriptionModel';
import { ScenarioWithPersonalityDto } from '../dtos/scenarios.dto';
import { PersonalityDto } from '../dtos/personalities.dto';
import { ProfileDto } from '../dtos/profiles.dto';
import { ConversationMessageDto, ConversationLogDto, ConversationWithPersonalityDto } from '../dtos/conversations.dto';
import { ConversationRoleDto } from '../dtos/conversation-roles.dto';


function dateToString(date: Date): string;
function dateToString(date: Date | null): string | null;
function dateToString(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isConversationMessage(value: unknown): value is ConversationMessageDto {
  return (
    isRecord(value) &&
    (value.role === 'user' || value.role === 'assistant') &&
    typeof value.content === 'string' &&
    typeof value.timestamp === 'string'
  );
}

function isConversationLog(value: unknown): value is ConversationLogDto {
  return (
    isRecord(value) &&
    typeof value.timestamp === 'string' &&
    (value.level === 'log' || value.level === 'error' || value.level === 'warn') &&
    typeof value.message === 'string' &&
    (
      value.data === undefined ||
      value.data === null ||
      isRecord(value.data)
    )
  );
}

function mapConversationMessages(
  messages: unknown,
): ConversationMessageDto[] | null {
  if (!Array.isArray(messages)) {
    return null;
  }

  return messages.flatMap((message) => {
    if (!isConversationMessage(message)) {
      return [];
    }

    return [{
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
    }];
  });
}

function mapConversationLogs(
  logs: unknown,
): ConversationLogDto[] | null {
  if (!Array.isArray(logs)) {
    return null;
  }

  return logs.flatMap((log) => {
    if (!isConversationLog(log)) {
      return [];
    }

    const mappedLog = {
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
    };

    if (log.data === undefined) {
      return [mappedLog];
    }

    return [{
      ...mappedLog,
      data: log.data,
    }];
  });
}

export function appConfigEntityToDto(config: AppConfig): AppConfigDto {
  return {
    id: config.id,
    validFrom: dateToString(config.validFrom),
    validTo: dateToString(config.validTo),
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

// ============================================================
// Model Mappers
// ============================================================
export function responseModelEntityToDto(model: ResponseModel): ResponseModelDto {
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

export function ttsModelEntityToDto(model: TtsModel): TtsModelDto {
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

export function realtimeModelEntityToDto(model: RealtimeModel): RealtimeModelDto {
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

export function realtimeTranscriptionModelEntityToDto(
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

export function timestampedTranscriptionModelEntityToDto(
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

export function customSelectionWithModelsToDto(
  selection: AdminUserCustomModelSelection & {
    responseModel: ResponseModelModel | null;
    ttsModel: TtsModelModel | null;
    realtimeModel: RealtimeModelModel | null;
    realtimeTranscriptionModel: RealtimeTranscriptionModelModel | null;
    timestampedTranscriptionModel: TimestampedTranscriptionModelModel | null;
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
    responseModel: selection.responseModel ? responseModelEntityToDto(selection.responseModel) : null,
    ttsModel: selection.ttsModel ? ttsModelEntityToDto(selection.ttsModel) : null,
    realtimeModel: selection.realtimeModel ? realtimeModelEntityToDto(selection.realtimeModel) : null,
    realtimeTranscriptionModel: selection.realtimeTranscriptionModel ?
      realtimeTranscriptionModelEntityToDto(selection.realtimeTranscriptionModel) :
      null,
    timestampedTranscriptionModel: selection.timestampedTranscriptionModel ?
      timestampedTranscriptionModelEntityToDto(selection.timestampedTranscriptionModel) :
      null,
  };
}

export function scenarioWithPersonalityEntityToDto(
  scenario: Scenario & { personality: { id: number; name: string; avatarUrl: string | null } | null },
): ScenarioWithPersonalityDto {
  return {
    id: scenario.id,
    createdAt: dateToString(scenario.createdAt),
    involvedPersonalityId: scenario.involvedPersonalityId,
    situationDescriptionEn: scenario.situationDescriptionEn,
    settingEn: scenario.settingEn,
    situationDescriptionCs: scenario.situationDescriptionCs,
    settingCs: scenario.settingCs,
    personality: scenario.personality,
  };
}

export function conversationRoleEntityToDto(role: ConversationRole): ConversationRoleDto {
  return {
    id: role.id,
    createdAt: dateToString(role.createdAt),
    nameEn: role.nameEn,
    nameCs: role.nameCs,
  };
}

export function personalityEntityToDto(personality: Personality): PersonalityDto {
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


export function profileEntityToDto(
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
    confirmedAt: dateToString(profile.confirmedAt),
  };
}

export function conversationWithPersonalityEntityToDto(
  conversation: Conversation & {
    personality: { id: number; name: string; avatarUrl: string | null } | null;
    scenario?: { id: number; situationDescriptionEn: string; situationDescriptionCs: string } | null;
  },
): ConversationWithPersonalityDto {
  return {
    id: conversation.id,
    createdAt: dateToString(conversation.createdAt),
    userId: conversation.userId,
    personalityId: conversation.personalityId,
    scenarioId: conversation.scenarioId,
    startTime: dateToString(conversation.startTime),
    endTime: dateToString(conversation.endTime),
    endedReason: conversation.endedReason,
    messages: mapConversationMessages(conversation.messages),
    logs: mapConversationLogs(conversation.logs),
    conversationType: conversation.conversationType,
    personality: conversation.personality,
    scenario: conversation.scenario,
  };
}
