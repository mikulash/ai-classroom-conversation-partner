import {
  AppConfigApiFp,
  ConversationRolesApiFp,
  PersonalitiesApiFp,
  ScenariosApiFp,
  UpdateAppConfigDto,
} from '../generated';
import { api } from '../api';
import { AxiosError } from 'axios';
import { AppConfigModel, InitialConversationOptions } from '../../models';
import {
  appConfigDtoToModel,
  conversationRoleDtoToModel,
  personalityDtoToModel,
  scenarioWithPersonalityDtoToModel,
} from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';

const appConfigApi = AppConfigApiFp();
const conversationRolesApi = ConversationRolesApiFp();
const personalitiesApi = PersonalitiesApiFp();
const scenariosApi = ScenariosApiFp();

export const appConfigClient = {
  updateAppConfigModels: async (payload: UpdateAppConfigDto): Promise<ApiResponse<AppConfigModel>> => {
    try {
      const requestFn = await appConfigApi.appConfigControllerUpdateAppConfig(payload);
      const response = await requestFn(api);
      const data = appConfigDtoToModel(response.data);
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
      const [personalitiesFn, scenariosFn, conversationRolesFn, appConfigFn] = await Promise.all([
        personalitiesApi.personalitiesControllerGetPersonalities(),
        scenariosApi.scenariosControllerGetScenarios(),
        conversationRolesApi.conversationRolesControllerGetConversationRoles(),
        appConfigApi.appConfigControllerGetAppConfig(),
      ]);

      const [personalities, scenarios, conversationRoles, appConfig] = await Promise.all([
        personalitiesFn(api),
        scenariosFn(api),
        conversationRolesFn(api),
        appConfigFn(api),
      ]);

      return {
        personalities: personalities.data.map(personalityDtoToModel),
        scenarios: scenarios.data.map(scenarioWithPersonalityDtoToModel),
        conversationRoles: conversationRoles.data.map(conversationRoleDtoToModel),
        appConfig: appConfigDtoToModel(appConfig.data),
      };
    } catch (error) {
      console.error('Error fetching initial data:', error);
      throw error;
    }
  },
};
