import {
  ProfilesApiFp,
  UpdateProfileDto,
  UpdateUserRoleDto,
} from '../generated';
import { api } from '../api';
import { AxiosError } from 'axios';
import { ProfileModel } from '../../models';
import { profileDtoToModel } from '../../dtoToModelMappers';
import { ApiResponse } from '../client.types';

const profilesApi = ProfilesApiFp();

/**
 * methods to access user profiles.
 * method to create profile is missing as profiles are created directly when users register.
 */
export const profileClient = {
  getAll: async (): Promise<ApiResponse<ProfileModel[]>> => {
    try {
      const requestFn = await profilesApi.profilesControllerGetProfiles();
      const response = await requestFn(api);
      const data = response.data.map(profileDtoToModel);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return { data: null, error: { message: axiosError.response?.data.message ?? 'Failed to fetch profiles' } };
    }
  },

  upsert: async (profileId: string, payload: UpdateProfileDto): Promise<ApiResponse<ProfileModel>> => {
    try {
      const requestFn = await profilesApi.profilesControllerUpdateProfile(profileId, payload);
      const response = await requestFn(api);
      const data = profileDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update profile' },
      };
    }
  },

  updateRole: async (profileId: string, role: UpdateUserRoleDto['userRole']): Promise<ApiResponse<ProfileModel>> => {
    try {
      const payload: UpdateUserRoleDto = { userRole: role };
      const requestFn = await profilesApi.profilesControllerUpdateUserRole(profileId, payload);
      const response = await requestFn(api);
      const data = profileDtoToModel(response.data);
      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to update role' },
      };
    }
  },
};
