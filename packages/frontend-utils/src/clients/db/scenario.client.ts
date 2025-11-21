import {
  ApiResponse,
  CreateScenarioRequest, MessageResponse,
  ScenarioWithPersonality,
  UpdateScenarioRequest,
} from '@repo/shared/types/dbRoutes.types';
import type { ScenarioWithPersonalityDto } from '@repo/shared/types/db/dto';
import { scenarioWithPersonalityDtoToEntity } from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { AxiosError } from 'axios';

export const scenarioClient = {
  all: async (): Promise<ApiResponse<ScenarioWithPersonality[]>> => {
    try {
      const response = await api.get<ScenarioWithPersonalityDto[]>('/api/scenarios');
      const data = response.data.map(scenarioWithPersonalityDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch scenarios' } };
    }
  },

  insert: async (scenario: CreateScenarioRequest): Promise<ApiResponse<ScenarioWithPersonality>> => {
    try {
      const response = await api.post<ScenarioWithPersonalityDto>('/api/scenarios', scenario);
      const data = scenarioWithPersonalityDtoToEntity(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to create scenario' },
      };
    }
  },

  update: async (id: number, scenario: UpdateScenarioRequest): Promise<ApiResponse<ScenarioWithPersonality>> => {
    try {
      const response = await api.put<ScenarioWithPersonalityDto>(`/api/scenarios/${String(id)}`, scenario);
      const data = scenarioWithPersonalityDtoToEntity(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update scenario' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await api.delete<MessageResponse>(`/api/scenarios/${String(id)}`);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete scenario' },
      };
    }
  },
};
