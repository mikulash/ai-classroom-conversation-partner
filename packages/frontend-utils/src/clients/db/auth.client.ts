import { AxiosError } from 'axios';
import {
  AuthApiFp,
  LoginDto,
  RefreshTokenDto,
  RegisterUserDto,
  RequestPasswordResetDto,
  ResendVerificationDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from '../generated';
import { api } from '../api';
import {
  authResponseDtoToModel,
  authTokensDtoToModel,
  messageDtoToModel,
  profileDtoToModel,
} from '../../dtoToModelMappers';
import {
  AuthenticatedUserModel,
  AuthTokensModel,
  MessageModel,
  ProfileModel,
} from '../../models';
import { ApiResponse } from '../client.types';

const authApi = AuthApiFp();

export const authClient = {
  /**
   * Register a new user
   */
  register: async (payload: RegisterUserDto): Promise<ApiResponse<MessageModel>> => {
    try {
      const requestFn = await authApi.authControllerRegister(payload);
      const response = await requestFn(api);
      return { data: messageDtoToModel(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Registration failed' },
      };
    }
  },

  /**
   * Verify email using token from verification link
   */
  verifyEmail: async (token: string): Promise<ApiResponse<AuthenticatedUserModel>> => {
    try {
      const requestFn = await authApi.authControllerVerifyEmail(token);
      const response = await requestFn(api);
      const data = authResponseDtoToModel(response.data);

      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('refresh_token', response.data.refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(data.user));

      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Email verification failed' },
      };
    }
  },

  resendVerificationEmail: async (payload: ResendVerificationDto): Promise<ApiResponse<MessageModel>> => {
    try {
      const requestFn = await authApi.authControllerResendVerification(payload);
      const response = await requestFn(api);
      return { data: messageDtoToModel(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Unable to resend verification email right now.' },
      };
    }
  },

  /**
   * Sign in with email and password
   */
  login: async (email: string, password: string): Promise<ApiResponse<AuthenticatedUserModel>> => {
    try {
      const payload: LoginDto = { email, password };
      const requestFn = await authApi.authControllerLogin(payload);
      const response = await requestFn(api);
      const data = authResponseDtoToModel(response.data);

      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('refresh_token', response.data.refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(data.user));

      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Login failed' },
      };
    }
  },

  /**
   * Get current user profile from backend
   */
  getCurrentUser: async (): Promise<ApiResponse<ProfileModel>> => {
    try {
      const requestFn = await authApi.authControllerMe();
      const response = await requestFn(api);
      const user = profileDtoToModel(response.data);

      localStorage.setItem('user_profile', JSON.stringify(user));
      return { data: user };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to fetch user profile' },
      };
    }
  },

  /**
   * Manually refresh the access token
   */
  refreshToken: async (): Promise<ApiResponse<AuthTokensModel>> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return {
          data: null,
          error: { message: 'No refresh token available' },
        };
      }

      const payload: RefreshTokenDto = { refreshToken };
      const requestFn = await authApi.authControllerRefresh(payload);
      const response = await requestFn(api);
      const data = authTokensDtoToModel(response.data);

      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);

      return { data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Token refresh failed' },
      };
    }
  },

  /**
   * Sign out from current device
   */
  signOut: async (): Promise<ApiResponse<MessageModel>> => {
    let data: MessageModel = { message: 'Signed out successfully' };

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        const payload: RefreshTokenDto = { refreshToken };
        const requestFn = await authApi.authControllerLogout(payload);
        const response = await requestFn(api);
        data = messageDtoToModel(response.data);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
    }

    return { data };
  },

  /**
   * Request password reset email
   */
  resetPasswordForEmail: async (email: string): Promise<ApiResponse<MessageModel>> => {
    try {
      const payload: RequestPasswordResetDto = { email };
      const requestFn = await authApi.authControllerRequestPasswordReset(payload);
      const response = await requestFn(api);
      return { data: messageDtoToModel(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to request password reset' },
      };
    }
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<MessageModel>> => {
    try {
      const payload: ResetPasswordDto = { token, newPassword };
      const requestFn = await authApi.authControllerResetPassword(payload);
      const response = await requestFn(api);
      return { data: messageDtoToModel(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Failed to reset password' },
      };
    }
  },

  /**
   * Update password
   */
  updatePassword: async (
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<MessageModel>> => {
    try {
      const payload: UpdatePasswordDto = { currentPassword, newPassword };
      const requestFn = await authApi.authControllerUpdatePassword(payload);
      const response = await requestFn(api);
      return { data: messageDtoToModel(response.data) };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Password update failed' },
      };
    }
  },
};
