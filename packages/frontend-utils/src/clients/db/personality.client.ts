import {
  ApiResponse,
  CreatePersonalityRequest,
  MessageResponse,
  UpdatePersonalityRequest,
} from '@repo/shared/types/dbRoutes.types';
import { Personality } from '@repo/shared/types/db/entities';
import type { PersonalityDto } from '@repo/shared/types/db/dto';
import { personalityDtoToEntity } from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { AxiosError } from 'axios';

export const personalityClient = {
  all: async (): Promise<ApiResponse<Personality[]>> => {
    try {
      const response = await api.get<PersonalityDto[]>('/api/personalities');
      const data = response.data.map(personalityDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch personalities' } };
    }
  },

  insert: async (personality: CreatePersonalityRequest): Promise<ApiResponse<Personality>> => {
    try {
      const response = await api.post<PersonalityDto>('/api/personalities', personality);
      const data = personalityDtoToEntity(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to create personality' },
      };
    }
  },

  update: async (id: number, personality: UpdatePersonalityRequest): Promise<ApiResponse<Personality>> => {
    try {
      const response = await api.put<PersonalityDto>(`/api/personalities/${id}`, personality);
      const data = personalityDtoToEntity(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update personality' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await api.delete<MessageResponse>(`/api/personalities/${String(id)}`);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete personality' },
      };
    }
  },
};

