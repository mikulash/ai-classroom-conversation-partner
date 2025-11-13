import { ApiResponse, ProfileResponse, UpdateProfileRequest, UpdateUserRoleRequest } from '@repo/shared/types/dbRoutes.types';
import { api } from '../api';
import { UserRole } from '@repo/shared/types/db/enums';

export const profileClient = {
  getAll: async (): Promise<ApiResponse<ProfileResponse[]>> => {
    try {
      const response = await api.get<ProfileResponse[]>('/api/profiles');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch profiles' } };
    }
  },

  upsert: async (profileId: string, payload: UpdateProfileRequest): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const response = await api.put<ProfileResponse>(`/api/profiles/${profileId}`, payload);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as ProfileResponse,
        error: { message: error.response?.data?.message || 'Failed to update profile' },
      };
    }
  },

  updateRole: async (profileId: string, role: UserRole): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const payload: UpdateUserRoleRequest = { userRole: role };
      const response = await api.put<ProfileResponse>(`/api/profiles/${profileId}/role`, payload);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as unknown as ProfileResponse,
        error: { message: error.response?.data?.message || 'Failed to update role' },
      };
    }
  },
};
