import {
  AuthTokensResponse, LoginRequest, LogoutRequest,
  MessageResponse, ProfileResponse, RefreshTokenRequest, RegisterResponse, RegisterUserRequest,
  RequestPasswordResetRequest, ResendVerificationRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  AuthResponse,
} from '@repo/shared/types/dbRoutes.types';
import { api } from '../api';
import { AxiosError } from 'axios';

export const authClient = {
  /**
     * Register a new user
     */
  register: async (payload: RegisterUserRequest) => {
    try {
      const response = await api.post<RegisterResponse>('/api/auth/register', payload);

      const { message } = response.data;

      return {
        data: {
          message,
        },
        error: null,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: { message: null },
        error: { message: axiosError.response?.data.message ?? 'Registration failed' },
      };
    }
  },

  /**
     * Verify email using token from verification link
     */
  verifyEmail: async (token: string) => {
    try {
      const response = await api.get<AuthResponse>('/api/auth/verify-email', {
        params: { token },
      });

      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(user));

      return {
        data: {
          user,
          session: { access_token: accessToken, user },
        },
        error: null,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: { user: null, session: null },
        error: { message: axiosError.response?.data.message ?? 'Email verification failed' },
      };
    }
  },

  resendVerificationEmail: async (payload: ResendVerificationRequest) => {
    try {
      const response = await api.post<MessageResponse>('/api/auth/resend-verification', payload);

      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: {
          message:
                        axiosError.response?.data.message ?? 'Unable to resend verification email right now.',
        },
      };
    }
  },

  /**
     * Sign in with email and password
     */
  login: async (email: string, password: string) => {
    try {
      const payload: LoginRequest = { email, password };
      const response = await api.post<AuthResponse>('/api/auth/login', payload);

      const { user, accessToken, refreshToken } = response.data;

      // Store tokens and user in localStorage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(user));

      return {
        data: {
          user,
          session: { access_token: accessToken, user },
        },
        error: null,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: { user: null, session: null },
        error: { message: axiosError.response?.data.message ?? 'Login failed' },
      };
    }
  },

  /**
     * Get current user profile from backend
     */
  getCurrentUser: async () => {
    try {
      const response = await api.get<ProfileResponse>('/api/auth/me');
      const user = response.data;

      // Update stored user profile
      localStorage.setItem('user_profile', JSON.stringify(user));

      return { data: user, error: null };
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
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const payload: RefreshTokenRequest = { refreshToken };
      const response = await api.post<AuthTokensResponse>('/api/auth/refresh', payload);

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);

      return { data: { accessToken }, error: null };
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
  signOut: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        const payload: LogoutRequest = { refreshToken };
        await api.post<MessageResponse>('/api/auth/logout', payload);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
    }

    return { error: null };
  },

  /**
     * Request password reset email
     */
  resetPasswordForEmail: async (email: string) => {
    try {
      const payload: RequestPasswordResetRequest = { email };
      await api.post<MessageResponse>('/api/auth/request-password-reset', payload);
      return { data: null, error: null };
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
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const payload: ResetPasswordRequest = { token, newPassword };
      await api.post<MessageResponse>('/api/auth/reset-password', payload);
      return { data: null, error: null };
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
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const payload: UpdatePasswordRequest = { currentPassword, newPassword };
      await api.put<MessageResponse>('/api/auth/password', payload);
      return { data: null, error: null };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      return {
        data: null,
        error: { message: axiosError.response?.data.message ?? 'Password update failed' },
      };
    }
  },
};
