import {
  ApiResponse,
  ConversationWithPersonality,
  CreateConversationRequest,
  MessageResponse,
} from '@repo/shared/types/dbRoutes.types';
import type { ConversationWithPersonalityDto } from '@repo/shared/types/db/dto';
import { conversationWithPersonalityDtoToEntity } from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { toErrorMessage } from '../../utils/errorHandling';

export const conversationClient = {
  /**
     * User profile page
     * for viewing previous conversations of the signed in user
     */
  getCurrentUserConversations: async (): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonalityDto[]>('/api/conversations');
      const data = response.data.map(conversationWithPersonalityDtoToEntity);
      return { data };
    } catch (error: unknown) {
      return { data: null, error: { message: toErrorMessage(error, 'Failed to fetch conversations') } };
    }
  },
  /**
     * Fetches all conversations for the selected user.
     * Used in admin/user-profiles page.
     * @param userId
     */
  getByUserId: async (userId: string): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonalityDto[]>(`/api/conversations/user/${userId}`);
      const data = response.data.map(conversationWithPersonalityDtoToEntity);
      return { data };
    } catch (error: unknown) {
      return { data: null, error: { message: toErrorMessage(error, 'Failed to fetch user conversations') } };
    }
  },
  /**
     * Saving conversation after it has ended.
     * @param conversation
     */
  insert: async (conversation: CreateConversationRequest): Promise<ApiResponse<ConversationWithPersonality>> => {
    try {
      const response = await api.post<ConversationWithPersonalityDto>('/api/conversations', conversation);
      const data = conversationWithPersonalityDtoToEntity(response.data);
      return { data };
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: toErrorMessage(error, 'Failed to create conversation') },
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
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: toErrorMessage(error, 'Failed to delete conversation') },
      };
    }
  },
};
