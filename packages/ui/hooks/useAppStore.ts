import { create } from 'zustand';
import { AppConfig, ConversationRole, Personality, Scenario } from '@repo/shared/generated/prisma/client';

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


