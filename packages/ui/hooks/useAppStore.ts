import { create } from 'zustand';
import { AppConfig, ConversationRole, Personality, Scenario } from '@repo/shared/types/db/entities';
import { InitialConversationOptions } from '@repo/shared/types/dbRoutes.types';

interface AppState {
    isLoaded: boolean,
    personalities: Personality[];
    scenarios: Scenario[];
    conversationRoles: ConversationRole[];
    appConfig: AppConfig;
    setPersonalities: (p: Personality[]) => void;
    setScenarios: (s: Scenario[]) => void;
    setConversationRoles: (r: ConversationRole[]) => void;
    setAppConfig: (appConfig: AppConfig) => void;
    setInitialConversationOptions: (options: InitialConversationOptions) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  personalities: [],
  scenarios: [],
  conversationRoles: [],
  appConfig: {
    allowedDomains: [],
    appName: 'AI Figurant',
    editedAt: new Date(),
    id: 0,
    realtimeModelId: null,
    responseModelId: null,
    silenceTimeoutInSeconds: 20,
    maxConversationDurationInSeconds: 300,
    ttsModelId: null,
    realtimeTranscriptionModelId: null,
    timestampedTranscriptionModelId: null,
  },
  setAppConfig: (appConfig) => {
    set({ appConfig });
  },
  setPersonalities: (personalities) => {
    set({ personalities: personalities.sort((a, b) => a.id - b.id) });
  },
  setScenarios: (scenarios) => {
    set({ scenarios: scenarios.sort((a, b) => a.id - b.id) });
  },
  setConversationRoles: (conversationRoles) => {
    set({ conversationRoles: conversationRoles.sort((a, b) => a.id - b.id) });
  },
  setInitialConversationOptions: (options: InitialConversationOptions) => {
    set(() => ({
      personalities: options.personalities.sort((a, b) => a.id - b.id),
      scenarios: options.scenarios.sort((a, b) => a.id - b.id),
      conversationRoles: options.conversationRoles.sort((a, b) => a.id - b.id),
      appConfig: options.appConfig,
      isLoaded: true,
    }));
  },
}));


