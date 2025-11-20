import {
  AdminUserCustomModelSelection,
  AppConfig,
  AppConfigCreate,
  Conversation,
  ConversationCreate,
  ConversationRole,
  Personality,
  PersonalityCreate, Profile,
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
    scenarios: Scenario[];
    conversationRoles: ConversationRole[];
    appConfig: AppConfigWithModels;
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

export interface ProfileResponse extends Profile {
    email: string;
    confirmedAt: Date | null;
}

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

type ConversationPersonality = Pick<Personality, 'id' | 'name' | 'avatarUrl'>;

type ConversationScenario = Pick<
  Scenario,
  'id' | 'situationDescriptionEn' | 'situationDescriptionCs'
>;

export type ConversationWithPersonality = Conversation & {
  personality: ConversationPersonality | null;
  scenario?: ConversationScenario | null;
};


// ------------------------------------------------------------
// Personalities
// ------------------------------------------------------------

export type CreatePersonalityRequest = PersonalityCreate;

export type UpdatePersonalityRequest = Partial<Omit<Personality, 'id' | 'createdAt'>>;

export type PersonalityWithScenarios = Personality & {
  scenarios: Scenario[];
};

export type CreateScenarioRequest = ScenarioCreate;

export type UpdateScenarioRequest = Partial<Omit<Scenario, 'id' | 'createdAt'>>;

export type ScenarioWithPersonality = Scenario & {
  personality: Pick<Personality, 'id' | 'name' | 'avatarUrl'> | null;
};


// ------------------------------------------------------------
// Models & App Config
// ------------------------------------------------------------

export type UpdateAppConfigRequest = AppConfigCreate & { editedAt?: Date | string };

export type AppConfigWithModels = AppConfig & {
  responseModel: ResponseModel | null;
  ttsModel: TtsModel | null;
  realtimeModel: RealtimeModel | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
};

export type CustomSelectionWithModels = AdminUserCustomModelSelection & {
  responseModel: ResponseModel | null;
  ttsModel: TtsModel | null;
  realtimeModel: RealtimeModel | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
};

export type UpdateCustomModelSelectionRequest = Partial<
  Pick<
    AdminUserCustomModelSelection,
    | 'responseModelId'
    | 'ttsModelId'
    | 'realtimeModelId'
    | 'realtimeTranscriptionModelId'
    | 'timestampedTranscriptionModelId'
  >
>;
