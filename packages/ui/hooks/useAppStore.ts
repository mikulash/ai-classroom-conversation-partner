import { create } from 'zustand';
import { AppConfig, ConversationRole, Personality, Scenario } from '@repo/shared/types/supabase/supabaseTypeHelpers';

interface AppState {
    personalities: Personality[];
    scenarios: Scenario[];
    conversationRoles: ConversationRole[];
    appConfig: AppConfig;
    setPersonalities: (p: Personality[]) => void;
    setScenarios: (s: Scenario[]) => void;
    setConversationRoles: (r: ConversationRole[]) => void;
    setConversationOptions: (options: {
        personalities: Personality[];
        scenarios: Scenario[];
        conversationRoles: ConversationRole[];
    }) => void;
    setAppConfig: (appConfig: AppConfig) => void;
}


export const useAppStore = create<AppState>((set) => ({
  personalities: [],
  scenarios: [],
  conversationRoles: [],
  appConfig: {
    allowed_domains: [],
    app_name: 'AI Figurant',
    edited_at: '',
    id: 0,
    realtime_model_id: null,
    response_model_id: null,
    silence_timeout_in_seconds: 20,
    max_conversation_duration_in_seconds: 300,
    tts_model_id: null,
    realtime_transcription_model_id: null,
    timestamped_transcription_model_id: null,
  },
  setAppConfig: (appConfig) => set({ appConfig }),

  setPersonalities: (personalities) => set({ personalities }),
  setScenarios: (scenarios) => set({ scenarios }),
  setConversationRoles: (conversationRoles) => set({ conversationRoles }),
  setConversationOptions: (options: {
        personalities: Personality[],
        scenarios: Scenario[],
        conversationRoles: ConversationRole[]
    }) => set(() => ({
    personalities: options.personalities,
    scenarios: options.scenarios,
    conversationRoles: options.conversationRoles,
  }
  )),
}));


