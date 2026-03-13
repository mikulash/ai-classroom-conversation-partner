
import {
  CreateScenarioDto, MessageResponseDto,
  ScenariosApiFp,
  UpdateScenarioDto,
} from '../generated';
import { api } from '../api';
import { AxiosError } from 'axios';
import { scenarioWithPersonalityDtoToModel } from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';
import { ScenarioWithPersonalityModel } from '../../models';

const scenariosApi = ScenariosApiFp();

export const scenarioClient = {
  all: async (): Promise<ApiResponse<ScenarioWithPersonalityModel[]>> => {
    try {
      const requestFn = await scenariosApi.scenariosControllerGetScenarios();
      const response = await requestFn(api);
      const data = response.data.map(scenarioWithPersonalityDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch scenarios' } };
    }
  },

  insert: async (scenario: CreateScenarioDto): Promise<ApiResponse<ScenarioWithPersonalityModel>> => {
    try {
      const requestFn = await scenariosApi.scenariosControllerCreateScenario(scenario);
      const response = await requestFn(api);
      const data = scenarioWithPersonalityDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to create scenario' },
      };
    }
  },

  update: async (id: number, scenario: UpdateScenarioDto): Promise<ApiResponse<ScenarioWithPersonalityModel>> => {
    try {
      const requestFn = await scenariosApi.scenariosControllerUpdateScenario(String(id), scenario);
      const response = await requestFn(api);
      const data = scenarioWithPersonalityDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update scenario' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageResponseDto>> => {
    try {
      const requestFn = await scenariosApi.scenariosControllerDeleteScenario(String(id));
      const response = await requestFn(api);
      const data: MessageResponseDto = { message: response.data.message };
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete scenario' },
      };
    }
  },
};

