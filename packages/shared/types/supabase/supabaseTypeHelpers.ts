import { Enums, Tables, TablesInsert } from './database.types.js';

export type Profile = Tables<'profiles'>;
export type UserRole = Enums<'user_role'>;

export type TtsModel = Tables<'tts_models'>;
export type ResponseModel = Tables<'response_models'>;
export type RealtimeModel = Tables<'realtime_models'>;
export type RealtimeTranscriptionModel = Tables<'realtime_transcription_models'>;
export type TimestampedTranscriptionModel = Tables<'timestamped_transcription_models'>;
export type AppConfig = Tables<'app_config'>;

export type Conversation = Tables<'conversations'>;
export type ConversationInsert = TablesInsert<'conversations'>;

export type ProfileInsert = TablesInsert<'profiles'>
export type Personality = Tables<'personalities'>
export type PersonalityInsert = TablesInsert<'personalities'>
export type Scenario = Tables<'scenarios'>
export type ConversationRole = Tables<'conversation_roles'>
export type ScenarioInsert = TablesInsert<'scenarios'>
export type CustomModelSelection = Tables<'admin_users_custom_model_selection'>
