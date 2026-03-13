import {
  MessageResponseDto,
  ModelsApiFp,
  UpdateCustomModelSelectionDto,
} from '../generated';
import { api } from '../api';
import { AxiosError } from 'axios';
import {
  CustomSelectionWithModelsModel,
  RealtimeModelModel,
  RealtimeTranscriptionModelModel,
  ResponseModelModel,
  TimestampedTranscriptionModelModel,
  TtsModelModel,
} from '../../models';
import {
  customSelectionWithModelsDtoToModel,
  realtimeModelDtoToModel,
  realtimeTranscriptionModelDtoToModel,
  responseModelDtoToModel,
  timestampedTranscriptionModelDtoToModel,
  ttsModelDtoToModel,
} from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';

const modelsApi = ModelsApiFp();

export const modelClient = {
  responseModels: async (): Promise<ApiResponse<ResponseModelModel[]>> => {
    try {
      const requestFn = await modelsApi.modelsControllerGetResponseModels();
      const response = await requestFn(api);
      const data = response.data.map(responseModelDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch response models' } };
    }
  },

  ttsModels: async (): Promise<ApiResponse<TtsModelModel[]>> => {
    try {
      const requestFn = await modelsApi.modelsControllerGetTtsModels();
      const response = await requestFn(api);
      const data = response.data.map(ttsModelDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch TTS models' } };
    }
  },

  realtimeModels: async (): Promise<ApiResponse<RealtimeModelModel[]>> => {
    try {
      const requestFn = await modelsApi.modelsControllerGetRealtimeModels();
      const response = await requestFn(api);
      const data = response.data.map(realtimeModelDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch realtime models' } };
    }
  },

  realtimeTranscriptionModels: async (): Promise<ApiResponse<RealtimeTranscriptionModelModel[]>> => {
    try {
      const requestFn = await modelsApi.modelsControllerGetRealtimeTranscriptionModels();
      const response = await requestFn(api);
      const data = response.data.map(realtimeTranscriptionModelDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to fetch realtime transcription models' },
      };
    }
  },

  timestampedTranscriptionModels: async (): Promise<ApiResponse<TimestampedTranscriptionModelModel[]>> => {
    try {
      const requestFn = await modelsApi.modelsControllerGetTimestampedTranscriptionModels();
      const response = await requestFn(api);
      const data = response.data.map(timestampedTranscriptionModelDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to fetch transcription models' },
      };
    }
  },

  customModelSelection: async (userId: string): Promise<ApiResponse<CustomSelectionWithModelsModel | null>> => {
    try {
      const requestFn = await modelsApi.modelsControllerGetCustomSelection(userId);
      const response = await requestFn(api);
      const data = response.data ? customSelectionWithModelsDtoToModel(response.data) : null;
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
    payload: UpdateCustomModelSelectionDto,
  ): Promise<ApiResponse<CustomSelectionWithModelsModel>> => {
    try {
      const requestFn = await modelsApi.modelsControllerUpdateCustomSelection(userId, payload);
      const response = await requestFn(api);
      const data = customSelectionWithModelsDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update admin selection' },
      };
    }
  },

  deleteCustomModelSelection: async (userId: string): Promise<ApiResponse<MessageResponseDto>> => {
    try {
      const requestFn = await modelsApi.modelsControllerDeleteCustomSelection(userId);
      const response = await requestFn(api);
      const data: MessageResponseDto = { message: response.data.message };
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete admin selection' },
      };
    }
  },
};

