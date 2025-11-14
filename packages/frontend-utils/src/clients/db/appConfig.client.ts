import {
  ConversationRole,
  Personality,
} from '@repo/shared/types/db/entities';
import {
  ApiResponse,
  AppConfigWithModels,
  InitialConversationOptions, ScenarioWithPersonality,
  UpdateAppConfigRequest,
} from '@repo/shared/types/dbRoutes.types';
import { api } from '../api';

export const appConfigClient = {
  updateAppConfigModels: async (payload: UpdateAppConfigRequest): Promise<ApiResponse<AppConfigWithModels>> => {
    try {
      const response = await api.put<AppConfigWithModels>('/api/app-config', payload);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as AppConfigWithModels,
        error: { message: error.response?.data?.message || 'Failed to update app config' },
      };
    }
  },

  fetchInitialConversationOptions: async (): Promise<InitialConversationOptions> => {
    try {
      const [personalities, scenarios, conversationRoles, appConfig] = await Promise.all([
        api.get<Personality[]>('/api/personalities'),
        api.get<ScenarioWithPersonality[]>('/api/scenarios'),
        api.get<ConversationRole[]>('/api/conversation-roles'),
        api.get<AppConfigWithModels>('/api/app-config'),
      ]);

      return {
        personalities: personalities.data,
        scenarios: scenarios.data,
        conversationRoles: conversationRoles.data,
        appConfig: appConfig.data,
      };
    } catch (error: any) {
      console.error('Error fetching initial data:', error);
      throw error;
    }
  },
};
