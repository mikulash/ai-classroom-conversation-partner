import { supabase } from './clients/supabaseClient';
import type { PostgrestResponse, PostgrestSingleResponse, Session } from '@supabase/supabase-js';
import type {
  AppConfig,
  Conversation,
  ConversationInsert,
  CustomModelSelection,
  Personality,
  PersonalityInsert,
  Profile,
  ProfileInsert,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  Scenario,
  ScenarioInsert,
  TimestampedTranscriptionModel,
  TtsModel,
  UserRole,
} from '@repo/shared/types/supabase/supabaseTypeHelpers';

export type ConversationWithPersonality = Pick<
    Conversation,
    | 'id'
    | 'start_time'
    | 'end_time'
    | 'ended_reason'
    | 'conversation_type'
    | 'messages'
    | 'personality_id'
> & { personalities: { name: string } | null };

// Initial data used on app bootstrap
export async function fetchInitialData() {
  return Promise.all([
    supabase.from('personalities').select('*'),
    supabase.from('scenarios').select('*'),
    supabase.from('conversation_roles').select('*'),
    supabase.from('app_config').select('*').single(),
  ]);
}

// -------------------- Auth API --------------------
export const authApi = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void,
  ) => supabase.auth.onAuthStateChange(callback),
  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  resetPasswordForEmail: (email: string, redirectTo?: string) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo }),
  updatePassword: (newPassword: string) =>
    supabase.auth.updateUser({ password: newPassword }),
};

// -------------------- Profile API --------------------
export const profileApi = {
  getById: async (
    id: string,
    columns = '*',
  ): Promise<PostgrestSingleResponse<Profile>> =>
    supabase.from('profiles').select(columns).eq('id', id).single(),
  getAll: async (): Promise<PostgrestResponse<Profile>> =>
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  upsert: async (
    payload: ProfileInsert,
  ): Promise<PostgrestResponse<Profile>> =>
    supabase.from('profiles').upsert(payload, { onConflict: 'id' }).select(),
  updateRole: async (
    profileId: string,
    role: UserRole,
  ): Promise<PostgrestResponse<Profile>> =>
    supabase
      .from('profiles')
      .update({ user_role: role })
      .eq('id', profileId)
      .select(),
};

// -------------------- Conversation API --------------------
export const conversationApi = {
  byUser: async (
    userId: string,
  ): Promise<PostgrestResponse<ConversationWithPersonality>> =>
    supabase
      .from('conversations')
      .select(`
        id,
        start_time,
        end_time,
        ended_reason,
        conversation_type,
        messages,
        personality_id,
        personalities!conversations_personality_id_fkey (
          name
        )
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false }),
  insert: async (
    conversation: ConversationInsert,
  ): Promise<PostgrestResponse<Conversation>> =>
    supabase.from('conversations').insert(conversation).select(),
  delete: async (id: number): Promise<PostgrestResponse<Conversation>> =>
    supabase.from('conversations').delete().eq('id', id).select(),
};

// -------------------- Personalities API --------------------
export const personalityApi = {
  all: async (): Promise<PostgrestResponse<Personality>> =>
    supabase.from('personalities').select('*'),
  insert: async (
    personality: PersonalityInsert,
  ): Promise<PostgrestSingleResponse<Personality>> =>
    supabase
      .from('personalities')
      .insert([personality])
      .select()
      .single(),
  update: async (
    id: number,
    personality: Partial<Personality>,
  ): Promise<PostgrestResponse<Personality>> =>
    supabase.from('personalities').update(personality).eq('id', id).select(),
  delete: async (id: number): Promise<PostgrestResponse<Personality>> =>
    supabase.from('personalities').delete().eq('id', id).select(),
};

// -------------------- Scenarios API --------------------
export const scenarioApi = {
  all: async (): Promise<PostgrestResponse<Scenario>> =>
    supabase.from('scenarios').select('*'),
  insert: async (
    scenario: ScenarioInsert,
  ): Promise<PostgrestSingleResponse<Scenario>> =>
    supabase.from('scenarios').insert([scenario]).select().single(),
  update: async (
    id: number,
    scenario: Partial<Scenario>,
  ): Promise<PostgrestResponse<Scenario>> =>
    supabase.from('scenarios').update(scenario).eq('id', id).select(),
  delete: async (id: number): Promise<PostgrestResponse<Scenario>> =>
    supabase.from('scenarios').delete().eq('id', id).select(),
};

// -------------------- Model API --------------------
export const modelApi = {
  responseModels: async (): Promise<PostgrestResponse<ResponseModel>> =>
    supabase.from('response_models').select('*'),
  ttsModels: async (): Promise<PostgrestResponse<TtsModel>> =>
    supabase.from('tts_models').select('*'),
  realtimeModels: async (): Promise<PostgrestResponse<RealtimeModel>> =>
    supabase.from('realtime_models').select('*'),
  timestampedTranscriptionModels: async (): Promise<PostgrestResponse<TimestampedTranscriptionModel>> =>
    supabase.from('timestamped_transcription_models').select('*'),
  realtimeTranscriptionModels: async (): Promise<PostgrestResponse<RealtimeTranscriptionModel>> =>
    supabase.from('realtime_transcription_models').select('*'),
  adminUserSelection: async (
    userId: string,
  ): Promise<PostgrestSingleResponse<CustomModelSelection>> =>
    supabase
      .from('admin_users_custom_model_selection')
      .select('*')
      .eq('user_id', userId)
      .single(),
  upsertAdminUserSelection: async (
    payload: Omit<CustomModelSelection, 'created_at'> & { created_at?: string },
  ): Promise<PostgrestSingleResponse<CustomModelSelection>> =>
    supabase
      .from('admin_users_custom_model_selection')
      .upsert(payload)
      .select()
      .single(),
  updateAppConfigModels: async (
    payload: Partial<AppConfig>,
  ): Promise<PostgrestSingleResponse<AppConfig>> =>
    supabase.from('app_config').update(payload).eq('id', 1).select().single(),
};


