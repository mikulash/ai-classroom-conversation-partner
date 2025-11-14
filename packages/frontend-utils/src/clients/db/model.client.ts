import {
  AdminSelectionWithModels,
  ApiResponse, AppConfigWithModels,
  UpdateAdminSelectionRequest,
  UpdateAppConfigRequest,
} from '@repo/shared/types/dbRoutes.types';
import {
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  TimestampedTranscriptionModel,
  TtsModel,
} from '@repo/shared/types/db/entities';
import { api } from '../api';

export const modelClient = {
  responseModels: async (): Promise<ApiResponse<ResponseModel[]>> => {
    try {
      const response = await api.get<ResponseModel[]>('/api/models/response');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch response models' } };
    }
  },

  ttsModels: async (): Promise<ApiResponse<TtsModel[]>> => {
    try {
      const response = await api.get<TtsModel[]>('/api/models/tts');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch TTS models' } };
    }
  },

  realtimeModels: async (): Promise<ApiResponse<RealtimeModel[]>> => {
    try {
      const response = await api.get<RealtimeModel[]>('/api/models/realtime');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch realtime models' } };
    }
  },

  timestampedTranscriptionModels: async (): Promise<ApiResponse<TimestampedTranscriptionModel[]>> => {
    try {
      const response = await api.get<TimestampedTranscriptionModel[]>('/api/models/timestamped-transcription');
      return { data: response.data };
    } catch (error: any) {
      return {
        data: [],
        error: { message: error.response?.data?.message || 'Failed to fetch transcription models' },
      };
    }
  },

  realtimeTranscriptionModels: async (): Promise<ApiResponse<RealtimeTranscriptionModel[]>> => {
    try {
      const response = await api.get<RealtimeTranscriptionModel[]>('/api/models/realtime-transcription');
      return { data: response.data };
    } catch (error: any) {
      return {
        data: [],
        error: { message: error.response?.data?.message || 'Failed to fetch realtime transcription models' },
      };
    }
  },

  adminUserSelection: async (userId: string): Promise<ApiResponse<AdminSelectionWithModels | null>> => {
    try {
      const response = await api.get<AdminSelectionWithModels | null>(`/api/models/admin-selection/${userId}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch admin selection' },
      };
    }
  },

  upsertAdminUserSelection: async (
    userId: string,
    payload: UpdateAdminSelectionRequest,
  ): Promise<ApiResponse<AdminSelectionWithModels>> => {
    try {
      const response = await api.put<AdminSelectionWithModels>(`/api/models/admin-selection/${userId}`, payload);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as AdminSelectionWithModels,
        error: { message: error.response?.data?.message || 'Failed to update admin selection' },
      };
    }
  },
};
