import { ApiResponse, AppConfigWithModels, InitialConversationOptions } from '@repo/shared/types/dbRoutes.types';
import type {
    AppConfigDto,
    AppConfigWithModelsDto,
    ConversationRoleDto,
    PersonalityDto,
    ScenarioWithPersonalityDto,
} from '@repo/shared/types/db/dto';
import {
    appConfigDtoToEntity,
    appConfigWithModelsDtoToEntity,
    conversationRoleDtoToEntity,
    personalityDtoToEntity,
    scenarioWithPersonalityDtoToEntity,
} from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { AxiosError } from 'axios';
import {AppConfig, AppConfigCreate} from '@repo/shared/types/db/entities';

export const appConfigClient = {
  updateAppConfigModels: async (payload: AppConfigCreate): Promise<ApiResponse<AppConfig>> => {
    try {
      const response = await api.put<AppConfigDto>('/api/app-config', payload);
      const data = appConfigDtoToEntity(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update app config' },
      };
    }
  },

  fetchInitialConversationOptions: async (): Promise<InitialConversationOptions> => {
    try {
      const [personalities, scenarios, conversationRoles, appConfig] = await Promise.all([
        api.get<PersonalityDto[]>('/api/personalities'),
        api.get<ScenarioWithPersonalityDto[]>('/api/scenarios'),
        api.get<ConversationRoleDto[]>('/api/conversation-roles'),
        api.get<AppConfigDto>('/api/app-config'),
      ]);

      return {
        personalities: personalities.data.map(personalityDtoToEntity),
        scenarios: scenarios.data.map(scenarioWithPersonalityDtoToEntity),
        conversationRoles: conversationRoles.data.map(conversationRoleDtoToEntity),
        appConfig: appConfigDtoToEntity(appConfig.data),
      };
    } catch (error) {
      console.error('Error fetching initial data:', error);
      throw error;
    }
  },
};
