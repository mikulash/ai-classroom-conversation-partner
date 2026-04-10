import { create } from 'zustand';
import { AppConfigModel, InitialConversationOptionsModel, PersonalityModel, ScenarioModel, ConversationRoleModel } from '@repo/frontend-utils/src/models';

interface AppState {
    isLoaded: boolean,
    personalities: PersonalityModel[];
    scenarios: ScenarioModel[];
    conversationRoles: ConversationRoleModel[];
    appConfig: AppConfigModel;
    setPersonalities: (p: PersonalityModel[]) => void;
    setScenarios: (s: ScenarioModel[]) => void;
    setConversationRoles: (r: ConversationRoleModel[]) => void;
    setAppConfig: (appConfig: AppConfigModel) => void;
    setInitialConversationOptions: (options: InitialConversationOptionsModel) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoaded: false,
  personalities: [],
  scenarios: [],
  conversationRoles: [],
  appConfig: {
    allowedDomains: [],
    appName: 'AI Figurant',
    validFrom: new Date(),
    validTo: null,
    userId: null,
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
  setInitialConversationOptions: (options: InitialConversationOptionsModel) => {
    set(() => ({
      personalities: options.personalities.sort((a, b) => a.id - b.id),
      scenarios: options.scenarios.sort((a, b) => a.id - b.id),
      conversationRoles: options.conversationRoles.sort((a, b) => a.id - b.id),
      appConfig: options.appConfig,
      isLoaded: true,
    }));
  },
}));


