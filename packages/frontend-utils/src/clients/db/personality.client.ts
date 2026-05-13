import {
  CreatePersonalityDto,
  PersonalitiesApiFp,
  PersonalityDto,
  UpdatePersonalityDto,
} from '../generated';
import { api } from '../api';
import { AxiosError, AxiosProgressEvent } from 'axios';
import { MessageModel, PersonalityModel } from '../../models';
import { messageDtoToModel, personalityDtoToModel } from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';

const personalitiesApi = PersonalitiesApiFp();

interface AvatarUploadModel {
  avatarUrl: string;
}

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
      const requestFn = await personalitiesApi.personalitiesControllerUpdatePersonality(id, personality);
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

  uploadAvatar: async (id: number, avatar: File): Promise<ApiResponse<PersonalityModel>> => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      const response = await api.post<PersonalityDto>(`/api/personalities/${id}/avatar`, formData);
      const data = personalityDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to upload avatar' },
      };
    }
  },

  uploadAvatarFile: async (
    avatar: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<ApiResponse<AvatarUploadModel>> => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      const response = await api.post<AvatarUploadModel>('/api/personality-avatars', formData, {
        onUploadProgress,
      });
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to upload avatar' },
      };
    }
  },

  removeAvatar: async (id: number): Promise<ApiResponse<PersonalityModel>> => {
    try {
      const response = await api.delete<PersonalityDto>(`/api/personalities/${id}/avatar`);
      const data = personalityDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to remove avatar' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageModel>> => {
    try {
      const requestFn = await personalitiesApi.personalitiesControllerDeletePersonality(id);
      const response = await requestFn(api);
      const data = messageDtoToModel(response.data);
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
