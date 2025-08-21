import { Enums, Tables, TablesInsert } from './database.types.js';
import { Language } from '../language.js';
import { LANGUAGE } from '../../enums/Language.js';

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

export const universalDescriptionForScenario = (s: Scenario, lang: Language): {
    situationDescription: string;
    setting: string;
} => {
  const situationDescription =
        lang === LANGUAGE.EN ?
          s.situation_description_en :
          s.situation_description_cs;
  const setting = lang === LANGUAGE.EN ? s.setting_en : s.setting_cs;
  return {
    situationDescription,
    setting,
  };
};

export const universalDescriptionForPersonality = (p: Personality, lang: Language): {
    problemSummary: string,
    personalityDescription: string,

} => {
  const problemSummary = lang === LANGUAGE.EN ? p.problem_summary_en : p.problem_summary_cs;
  const personalityDescription = lang === LANGUAGE.EN ? p.personality_description_en : p.personality_description_cs;
  return {
    problemSummary,
    personalityDescription,
  };
};
