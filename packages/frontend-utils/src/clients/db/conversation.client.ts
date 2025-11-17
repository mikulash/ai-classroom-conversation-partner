import {
  ApiResponse,
  ConversationWithPersonality,
  CreateConversationRequest,
  MessageResponse,
} from '@repo/shared/types/dbRoutes.types';
import { api } from '../api';
import { AxiosError } from 'axios';

export const conversationClient = {
  /**
     * User profile page
     * for viewing previous conversations of the signed in user
     */
  getCurrentUserConversations: async (): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonality[]>('/api/conversations');
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: [], error: { message: axiosError.response?.data.message ?? 'Failed to fetch conversations' } };
    }
  },
  /**
     * Fetches all conversations for the selected user.
     * Used in admin/user-profiles page.
     * @param userId
     */
  getByUserId: async (userId: string): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonality[]>(`/api/conversations/user/${userId}`);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: [], error: { message: axiosError.response?.data.message ?? 'Failed to fetch user conversations' } };
    }
  },
  /**
     * Saving conversation after it has ended.
     * @param conversation
     */
  insert: async (conversation: CreateConversationRequest): Promise<ApiResponse<ConversationWithPersonality>> => {
    try {
      const response = await api.post<ConversationWithPersonality>('/api/conversations', conversation);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null as unknown as ConversationWithPersonality,
        error: { message: axiosError.response?.data.message ?? 'Failed to create conversation' },
      };
    }
  },
  /**
     * Delete conversation by id
     * @param id
     */
  delete: async (id: number): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await api.delete<MessageResponse>(`/api/conversations/${String(id)}`);
      return { data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null as unknown as MessageResponse,
        error: { message: axiosError.response?.data.message ?? 'Failed to delete conversation' },
      };
    }
  },
};
