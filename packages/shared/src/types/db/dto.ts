import {
  ConversationType,
  OpenAiVoiceName,
  RealtimeModelProvider,
  ResponseModelProvider,
  Sex,
  TimestampedTranscriptionModelProvider,
  TranscriptionModelProvider,
  TtsModelProvider,
  UserRole,
} from './enums';
import { ConversationLog } from '../conversationLog';
import { ConversationMessage } from '../conversationMessage';

// ============================================================
// App Config DTOs
// ============================================================

export interface AppConfigDto {
  id: number;
  editedAt: string;
  responseModelId: number | null;
  ttsModelId: number | null;
  realtimeModelId: number | null;
  silenceTimeoutInSeconds: number;
  allowedDomains: string[];
  appName: string;
  realtimeTranscriptionModelId: number | null;
  timestampedTranscriptionModelId: number | null;
  maxConversationDurationInSeconds: number;
}

// ============================================================
// User & Profile DTOs
// ============================================================

export interface ProfileDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  gender: string;
  userRole: UserRole;
  conversationRole: string;
  bio: string;
  email: string;
  confirmedAt: string | null;
}

// ============================================================
// Conversation DTOs
// ============================================================

export interface ConversationDto {
  id: number;
  createdAt: string;
  userId: string;
  personalityId: number | null;
  scenarioId: number | null;
  startTime: string;
  endTime: string;
  endedReason: string;
  messages: ConversationMessage[] | null;
  logs: ConversationLog[] | null;
  conversationType: ConversationType;
  usedConfig: AppConfigDto | null;
}

export interface ConversationWithPersonalityDto extends ConversationDto {
  personality: {
    id: number;
    name: string;
    avatarUrl: string | null;
  } | null;
  scenario?: {
    id: number;
    situationDescriptionEn: string;
    situationDescriptionCs: string;
  } | null;
}

// ============================================================
// Personality DTOs
// ============================================================

export interface PersonalityDto {
  id: number;
  createdAt: string;
  name: string;
  age: number | null;
  avatarUrl: string | null;
  gender: string;
  sex: Sex;
  voiceInstructions: string | null;
  elevenlabsVoiceId: string | null;
  openaiVoiceName: OpenAiVoiceName;
  problemSummaryEn: string;
  personalityDescriptionEn: string;
  problemSummaryCs: string;
  personalityDescriptionCs: string;
  isHidden: boolean;
}

export interface PersonalityWithScenariosDto extends PersonalityDto {
  scenarios: ScenarioDto[];
}

// ============================================================
// Scenario DTOs
// ============================================================

export interface ScenarioDto {
  id: number;
  createdAt: string;
  involvedPersonalityId: number | null;
  situationDescriptionEn: string;
  settingEn: string;
  situationDescriptionCs: string;
  settingCs: string;
}

export interface ScenarioWithPersonalityDto extends ScenarioDto {
  personality: {
    id: number;
    name: string;
    avatarUrl: string | null;
  } | null;
}

// ============================================================
// Conversation Role DTOs
// ============================================================

export interface ConversationRoleDto {
  id: number;
  createdAt: string;
  nameEn: string;
  nameCs: string;
}

// ============================================================
// Model DTOs
// ============================================================

export interface ResponseModelDto {
  id: number;
  createdAt: string;
  friendlyName: string;
  apiName: string;
  docsUrl: string | null;
  isEnabled: boolean;
  provider: ResponseModelProvider;
}

export interface TtsModelDto {
  id: number;
  createdAt: string;
  friendlyName: string;
  apiName: string;
  sampleRate: number;
  docsUrl: string;
  isEnabled: boolean;
  provider: TtsModelProvider;
  allowsWordLevelTimestampedTranscript: boolean;
}

export interface RealtimeModelDto {
  id: number;
  createdAt: string;
  friendlyName: string;
  apiName: string;
  docsUrl: string | null;
  isEnabled: boolean;
  provider: RealtimeModelProvider;
}

export interface RealtimeTranscriptionModelDto {
  id: number;
  createdAt: string;
  friendlyName: string;
  provider: TranscriptionModelProvider;
  apiName: string;
  docsUrl: string | null;
  isEnabled: boolean | null;
  allowsWordLevelTimestamps: boolean;
}

export interface TimestampedTranscriptionModelDto {
  id: number;
  createdAt: string;
  friendlyName: string;
  provider: TimestampedTranscriptionModelProvider;
  apiName: string;
  docsUrl: string | null;
  isEnabled: boolean;
}

export interface AppConfigWithModelsDto extends AppConfigDto {
  responseModel: ResponseModelDto | null;
  ttsModel: TtsModelDto | null;
  realtimeModel: RealtimeModelDto | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModelDto | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModelDto | null;
}

export interface CustomSelectionWithModelsDto {
  userId: string;
  createdAt: string;
  responseModelId: number | null;
  ttsModelId: number | null;
  realtimeModelId: number | null;
  realtimeTranscriptionModelId: number | null;
  timestampedTranscriptionModelId: number | null;
  responseModel: ResponseModelDto | null;
  ttsModel: TtsModelDto | null;
  realtimeModel: RealtimeModelDto | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModelDto | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModelDto | null;
}

// ============================================================
// Initial Options DTO
// ============================================================

export interface InitialConversationOptionsDto {
  personalities: PersonalityDto[];
  scenarios: ScenarioDto[];
  conversationRoles: ConversationRoleDto[];
  appConfig: AppConfigWithModelsDto;
}

export interface EmailVerificationResponseDto {
    user: ProfileDto;
    accessToken: string;
    refreshToken: string
}

export interface LoginResponseDto { user: ProfileDto; accessToken: string; refreshToken: string }
