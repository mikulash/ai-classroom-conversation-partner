import { ApiResponse, AppConfigWithModels, InitialConversationOptions } from '@repo/shared/types/dbRoutes.types';
import type {
  AppConfigWithModelsDto,
  ConversationRoleDto,
  PersonalityDto,
  ScenarioWithPersonalityDto,
} from '@repo/shared/types/db/dto';
import {
  appConfigWithModelsDtoToEntity,
  conversationRoleDtoToEntity,
  personalityDtoToEntity,
  scenarioWithPersonalityDtoToEntity,
} from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { toErrorMessage } from '../../utils/errorHandling';
import { AppConfigCreate } from '@repo/shared/types/db/entities';

export const appConfigClient = {
  updateAppConfigModels: async (payload: AppConfigCreate): Promise<ApiResponse<AppConfigWithModels>> => {
    try {
      const response = await api.put<AppConfigWithModelsDto>('/api/app-config', payload);
      const data = appConfigWithModelsDtoToEntity(response.data);
      return { data };
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: toErrorMessage(error, 'Failed to update app config') },
      };
    }
  },

  fetchInitialConversationOptions: async (): Promise<InitialConversationOptions> => {
    try {
      const [personalities, scenarios, conversationRoles, appConfig] = await Promise.all([
        api.get<PersonalityDto[]>('/api/personalities'),
        api.get<ScenarioWithPersonalityDto[]>('/api/scenarios'),
        api.get<ConversationRoleDto[]>('/api/conversation-roles'),
        api.get<AppConfigWithModelsDto>('/api/app-config'),
      ]);

      return {
        personalities: personalities.data.map(personalityDtoToEntity),
        scenarios: scenarios.data.map(scenarioWithPersonalityDtoToEntity),
        conversationRoles: conversationRoles.data.map(conversationRoleDtoToEntity),
        appConfig: appConfigWithModelsDtoToEntity(appConfig.data),
      };
    } catch (error: unknown) {
      console.error('Error fetching initial data:', error);
      throw error instanceof Error ? error : new Error('Error fetching initial data');
    }
  },
};
