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
import { api } from '../api';
import { AxiosError } from 'axios';

export const modelClient = {
  responseModels: async (): Promise<ApiResponse<ResponseModel[]>> => {
    try {
      const response = await api.get<ResponseModel[]>('/api/models/response');
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch response models' } };
    }
  },

  ttsModels: async (): Promise<ApiResponse<TtsModel[]>> => {
    try {
      const response = await api.get<TtsModel[]>('/api/models/tts');
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch TTS models' } };
    }
  },

  realtimeModels: async (): Promise<ApiResponse<RealtimeModel[]>> => {
    try {
      const response = await api.get<RealtimeModel[]>('/api/models/realtime');
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch realtime models' } };
    }
  },

  realtimeTranscriptionModels: async (): Promise<ApiResponse<RealtimeTranscriptionModel[]>> => {
    try {
      const response = await api.get<RealtimeTranscriptionModel[]>('/api/models/realtime-transcription');
      return { data: response.data };
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
      const response = await api.get<TimestampedTranscriptionModel[]>('/api/models/timestamped-transcription');
      return { data: response.data };
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
      const response = await api.get<CustomSelectionWithModels | null>(`/api/models/custom-selection/${userId}`);
      return { data: response.data };
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
      const response = await api.put<CustomSelectionWithModels>(`/api/models/custom-selection/${userId}`, payload);
      return { data: response.data };
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
