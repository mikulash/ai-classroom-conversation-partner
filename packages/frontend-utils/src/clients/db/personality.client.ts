import { ApiResponse, CreatePersonalityRequest, MessageResponse, UpdatePersonalityRequest } from '@repo/shared/types/dbRoutes.types';
import { Personality } from '@repo/shared/types/db/entities';
import { api } from '../api';

export const personalityClient = {
  all: async (): Promise<ApiResponse<Personality[]>> => {
    try {
      const response = await api.get<Personality[]>('/api/personalities');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch personalities' } };
    }
  },

  insert: async (personality: CreatePersonalityRequest): Promise<ApiResponse<Personality>> => {
    try {
      const response = await api.post<Personality>('/api/personalities', personality);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as Personality,
        error: { message: error.response?.data?.message || 'Failed to create personality' },
      };
    }
  },

  update: async (id: number, personality: UpdatePersonalityRequest): Promise<ApiResponse<Personality>> => {
    try {
      const response = await api.put<Personality>(`/api/personalities/${id}`, personality);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as Personality,
        error: { message: error.response?.data?.message || 'Failed to update personality' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await api.delete<MessageResponse>(`/api/personalities/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as MessageResponse,
        error: { message: error.response?.data?.message || 'Failed to delete personality' },
      };
    }
  },
};

