import {
  ConversationsApiFp,
  CreateConversationDto, MessageResponseDto,
} from '../generated';
import { api } from '../api';
import { AxiosError } from 'axios';
import { ConversationModel } from '../../models';
import { conversationDtoToModel } from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';

const conversationsApi = ConversationsApiFp();

export const conversationClient = {
  /**
   * User profile page
   * for viewing previous conversations of the signed in user
   */
  getCurrentUserConversations: async (): Promise<ApiResponse<ConversationModel[]>> => {
    try {
      const requestFn = await conversationsApi.conversationsControllerGetConversations();
      const response = await requestFn(api);
      const data = response.data.map(conversationDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch conversations' } };
    }
  },

  /**
   * Fetches all conversations for the selected user.
   * Used in admin/user-profiles page.
   * @param userId
   */
  getByUserId: async (userId: string): Promise<ApiResponse<ConversationModel[]>> => {
    try {
      const requestFn = await conversationsApi.conversationsControllerGetUserConversations(userId);
      const response = await requestFn(api);
      const data = response.data.map(conversationDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch user conversations' } };
    }
  },

  /**
   * Saving conversation after it has ended.
   * @param conversation
   */
  insert: async (conversation: CreateConversationDto): Promise<ApiResponse<ConversationModel>> => {
    try {
      const requestFn = await conversationsApi.conversationsControllerCreateConversation(conversation);
      const response = await requestFn(api);
      const data = conversationDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to create conversation' },
      };
    }
  },

  /**
   * Delete conversation by id
   * @param id
   */
  delete: async (id: number): Promise<ApiResponse<MessageResponseDto>> => {
    try {
      const requestFn = await conversationsApi.conversationsControllerDeleteConversation(String(id));
      const response = await requestFn(api);
      const data: MessageResponseDto = { message: response.data.message };
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete conversation' },
      };
    }
  },
};
