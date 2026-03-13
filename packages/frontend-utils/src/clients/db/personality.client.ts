import {
  CreatePersonalityDto, MessageResponseDto,
  PersonalitiesApiFp,
  UpdatePersonalityDto,
} from '../generated';
import { api } from '../api';
import { AxiosError } from 'axios';
import { PersonalityModel } from '../../models';
import { personalityDtoToModel } from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';

const personalitiesApi = PersonalitiesApiFp();

export const personalityClient = {
  all: async (): Promise<ApiResponse<PersonalityModel[]>> => {
    try {
      const requestFn = await personalitiesApi.personalitiesControllerGetPersonalities();
      const response = await requestFn(api);
      const data = response.data.map(personalityDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch personalities' } };
    }
  },

  insert: async (personality: CreatePersonalityDto): Promise<ApiResponse<PersonalityModel>> => {
    try {
      const requestFn = await personalitiesApi.personalitiesControllerCreatePersonality(personality);
      const response = await requestFn(api);
      const data = personalityDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to create personality' },
      };
    }
  },

  update: async (id: number, personality: UpdatePersonalityDto): Promise<ApiResponse<PersonalityModel>> => {
    try {
      const requestFn = await personalitiesApi.personalitiesControllerUpdatePersonality(String(id), personality);
      const response = await requestFn(api);
      const data = personalityDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update personality' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageResponseDto>> => {
    try {
      const requestFn = await personalitiesApi.personalitiesControllerDeletePersonality(String(id));
      const response = await requestFn(api);
      const data: MessageResponseDto = { message: response.data.message };
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete personality' },
      };
    }
  },
};

