import {
  CustomSelectionWithModels,
  ApiResponse,
  UpdateCustomModelSelectionRequest,
  MessageResponse,
} from '@repo/shared/types/dbRoutes.types';
import {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '@repo/shared/types/db/entities';
import type {
  CustomSelectionWithModelsDto,
  RealtimeModelDto,
  RealtimeTranscriptionModelDto,
  ResponseModelDto,
  TimestampedTranscriptionModelDto,
  TtsModelDto,
} from '@repo/shared/types/db/dto';
import {
  customSelectionWithModelsDtoToEntity,
  realtimeModelDtoToEntity,
  realtimeTranscriptionModelDtoToEntity,
  responseModelDtoToEntity,
  timestampedTranscriptionModelDtoToEntity,
  ttsModelDtoToEntity,
} from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { AxiosError } from 'axios';

export const modelClient = {
  responseModels: async (): Promise<ApiResponse<ResponseModel[]>> => {
    try {
      const response = await api.get<ResponseModelDto[]>('/api/models/response');
      const data = response.data.map(responseModelDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch response models' } };
    }
  },

  ttsModels: async (): Promise<ApiResponse<TtsModel[]>> => {
    try {
      const response = await api.get<TtsModelDto[]>('/api/models/tts');
      const data = response.data.map(ttsModelDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch TTS models' } };
    }
  },

  realtimeModels: async (): Promise<ApiResponse<RealtimeModel[]>> => {
    try {
      const response = await api.get<RealtimeModelDto[]>('/api/models/realtime');
      const data = response.data.map(realtimeModelDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch realtime models' } };
    }
  },

  realtimeTranscriptionModels: async (): Promise<ApiResponse<RealtimeTranscriptionModel[]>> => {
    try {
      const response = await api.get<RealtimeTranscriptionModelDto[]>('/api/models/realtime-transcription');
      const data = response.data.map(realtimeTranscriptionModelDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to fetch realtime transcription models' },
      };
    }
  },

  timestampedTranscriptionModels: async (): Promise<ApiResponse<TimestampedTranscriptionModel[]>> => {
    try {
      const response = await api.get<TimestampedTranscriptionModelDto[]>('/api/models/timestamped-transcription');
      const data = response.data.map(timestampedTranscriptionModelDtoToEntity);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to fetch transcription models' },
      };
    }
  },

  customModelSelection: async (userId: string): Promise<ApiResponse<CustomSelectionWithModels | null>> => {
    try {
      const response = await api.get<CustomSelectionWithModelsDto | null>(`/api/models/custom-selection/${userId}`);
      const data = response.data ? customSelectionWithModelsDtoToEntity(response.data) : null;
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to fetch admin selection' },
      };
    }
  },

  upsertCustomModelSelection: async (
    userId: string,
    payload: UpdateCustomModelSelectionRequest,
  ): Promise<ApiResponse<CustomSelectionWithModels>> => {
    try {
      const response = await api.put<CustomSelectionWithModelsDto>(`/api/models/custom-selection/${userId}`, payload);
      const data = customSelectionWithModelsDtoToEntity(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update admin selection' },
      };
    }
  },

  deleteCustomModelSelection: async (userId: string): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await api.delete<MessageResponse>(`/api/models/custom-selection/${userId}`);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete admin selection' },
      };
    }
  },
};
