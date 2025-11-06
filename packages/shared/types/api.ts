import {
  AdminUserCustomModelSelection,
  AppConfig,
  AppConfigCreate,
  Conversation,
  ConversationCreate,
  ConversationRole,
  Personality,
  PersonalityCreate,
  ProfileExtended,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  Scenario,
  ScenarioCreate,
  TimestampedTranscriptionModel,
  TtsModel,
} from './db/entities';
import { UserRole } from './db/enums';

export interface ErrorResponse {
  message: string;
}

export interface MessageResponse {
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: { message: string };
}

// ------------------------------------------------------------
// Auth
// ------------------------------------------------------------

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  gender?: string;
}

export type RegisterRequest = RegisterPayload;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: ProfileExtended;
  accessToken: string;
  refreshToken: string;
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

export type ProfileResponse = ProfileExtended;

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

export type ConversationWithDetails = Conversation & {
  personality: ConversationPersonality | null;
  scenario: ConversationScenario | null;
  user?: {
    id: string;
    email: string;
    fullName: string | null;
  } | null;
};

// ------------------------------------------------------------
// Personalities
// ------------------------------------------------------------

export type CreatePersonalityRequest = PersonalityCreate;

export type UpdatePersonalityRequest = Partial<Omit<Personality, 'id' | 'createdAt'>>;

export type PersonalityWithScenarios = Personality & {
  scenarios: Scenario[];
};

// ------------------------------------------------------------
// Scenarios
// ------------------------------------------------------------

export type CreateScenarioRequest = ScenarioCreate;

export type UpdateScenarioRequest = Partial<Omit<Scenario, 'id' | 'createdAt'>>;

export type ScenarioWithPersonality = Scenario & {
  personality: Pick<Personality, 'id' | 'name' | 'avatarUrl'> | null;
};

// ------------------------------------------------------------
// Conversation Roles
// ------------------------------------------------------------

export type ConversationRoleResponse = ConversationRole;

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

export type AdminSelectionWithModels = AdminUserCustomModelSelection & {
  responseModel: ResponseModel | null;
  ttsModel: TtsModel | null;
  realtimeModel: RealtimeModel | null;
  realtimeTranscriptionModel: RealtimeTranscriptionModel | null;
  timestampedTranscriptionModel: TimestampedTranscriptionModel | null;
};

export type UpdateAdminSelectionRequest = Partial<
  Pick<
    AdminUserCustomModelSelection,
    | 'responseModelId'
    | 'ttsModelId'
    | 'realtimeModelId'
    | 'realtimeTranscriptionModelId'
    | 'timestampedTranscriptionModelId'
  >
>;
