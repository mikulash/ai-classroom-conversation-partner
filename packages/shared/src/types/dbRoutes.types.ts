import {
  AdminUserCustomModelSelection,
  AppConfig,
  Conversation,
  ConversationCreate,
  ConversationRole,
  Personality,
  PersonalityCreate,
  Profile,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  Scenario,
  ScenarioCreate,
  TimestampedTranscriptionModel,
  TtsModel,
} from './db/entities';
import { UserRole } from './db/enums';

export interface InitialConversationOptions {
  personalities: Personality[];
  scenarios: ScenarioWithPersonality[];
  conversationRoles: ConversationRole[];
  appConfig: AppConfig;
}

export interface ErrorResponse {
  message: string;
}

export interface MessageResponse {
  message: string;
}

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data: null; error: { message: string } };

export interface RegisterUserRequest {
    email: string;
    password: string;
    fullName: string;
    gender: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: ProfileResponse;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ProfileResponse represents the user profile with email and confirmation status
export type ProfileResponse = Profile & { email: string; confirmedAt: Date | null };

export interface ResendVerificationRequest {
  email: string;
}

// ------------------------------------------------------------
// Profiles
// ------------------------------------------------------------

export interface UpdateProfileRequest {
  fullName?: string | null;
  gender?: string | null;
  conversationRole?: string;
  bio?: string | null;
}

export interface UpdateUserRoleRequest {
  userRole: UserRole;
}

// ------------------------------------------------------------
// Conversations
// ------------------------------------------------------------

export type CreateConversationRequest = ConversationCreate;

// ConversationWithPersonality includes the personality and scenario information
export type ConversationWithPersonality = Conversation & {
  personality: { id: number; name: string; avatarUrl: string | null } | null;
  scenario?: { id: number; situationDescriptionEn: string; situationDescriptionCs: string } | null;
};


// ------------------------------------------------------------
// Personalities
// ------------------------------------------------------------

export type CreatePersonalityRequest = PersonalityCreate;

export type UpdatePersonalityRequest = Partial<Omit<Personality, 'id' | 'createdAt'>>;

// PersonalityWithScenarios includes all scenarios for a personality
export type PersonalityWithScenarios = Personality & { scenarios: Scenario[] };

export type CreateScenarioRequest = ScenarioCreate;

export type UpdateScenarioRequest = Partial<Omit<Scenario, 'id' | 'createdAt'>>;

// ScenarioWithPersonality includes the personality information
export type ScenarioWithPersonality = Scenario & {
  personality: { id: number; name: string; avatarUrl: string | null } | null;
};


// ------------------------------------------------------------
// Models & App Config
// ------------------------------------------------------------


// AppConfigWithModels includes all model relations
export type AppConfigWithModels = AppConfig & {
  responseModel: ResponseModel | null;
  ttsModel: TtsModel | null;
  realtimeModel: RealtimeModel | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
};

// CustomSelectionWithModels includes all custom model selections for a user
export type CustomSelectionWithModels = AdminUserCustomModelSelection & {
  responseModel: ResponseModel | null;
  ttsModel: TtsModel | null;
  realtimeModel: RealtimeModel | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
};

export type UpdateCustomModelSelectionRequest = Partial<{
  responseModelId: number | null;
  ttsModelId: number | null;
  realtimeModelId: number | null;
  realtimeTranscriptionModelId: number | null;
  timestampedTranscriptionModelId: number | null;
}>;
