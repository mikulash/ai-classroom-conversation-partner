import {
  ApiResponse,
  ProfileResponse,
  UpdateProfileRequest,
  UpdateUserRoleRequest,
} from '@repo/shared/types/dbRoutes.types';
import type { ProfileDto } from '@repo/shared/types/db/dto';
import { profileDtoToEntity } from '@repo/shared/mappers/dtoToEntityMappers';
import { api } from '../api';
import { UserRole } from '@repo/shared/types/db/enums';
import { toErrorMessage } from '../../utils/errorHandling';

/**
 * methods to access user profiles.
 * method to create profile is missing as profiles are created directly when users register.
 */
export const profileClient = {
  getAll: async (): Promise<ApiResponse<ProfileResponse[]>> => {
    try {
      const response = await api.get<ProfileDto[]>('/api/profiles');
      const data = response.data.map(profileDtoToEntity);
      return { data };
    } catch (error: unknown) {
      return { data: null, error: { message: toErrorMessage(error, 'Failed to fetch profiles') } };
    }
  },

  upsert: async (profileId: string, payload: UpdateProfileRequest): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const response = await api.put<ProfileDto>(`/api/profiles/${profileId}`, payload);
      const data = profileDtoToEntity(response.data);
      return { data };
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: toErrorMessage(error, 'Failed to update profile') },
      };
    }
  },

  updateRole: async (profileId: string, role: UserRole): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const payload: UpdateUserRoleRequest = { userRole: role };
      const response = await api.put<ProfileDto>(`/api/profiles/${profileId}/role`, payload);
      const data = profileDtoToEntity(response.data);
      return { data };
    } catch (error: unknown) {
      return {
        data: null,
        error: { message: toErrorMessage(error, 'Failed to update role') },
      };
    }
  },
};
