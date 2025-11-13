import {
  ApiResponse,
  ConversationWithPersonality,
  CreateConversationRequest,
  MessageResponse,
} from '@repo/shared/types/dbRoutes.types';
import { api } from '../api';

export const conversationClient = {
  getCurrent: async (): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonality[]>('/api/conversations');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch conversations' } };
    }
  },

  getByUserId: async (userId: string): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonality[]>(`/api/conversations/user/${userId}`);
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch user conversations' } };
    }
  },

  insert: async (conversation: CreateConversationRequest): Promise<ApiResponse<ConversationWithPersonality>> => {
    try {
      const response = await api.post<ConversationWithPersonality>('/api/conversations', conversation);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as ConversationWithPersonality,
        error: { message: error.response?.data?.message || 'Failed to create conversation' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<MessageResponse>> => {
    try {
      const response = await api.delete<MessageResponse>(`/api/conversations/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as MessageResponse,
        error: { message: error.response?.data?.message || 'Failed to delete conversation' },
      };
    }
  },
};
