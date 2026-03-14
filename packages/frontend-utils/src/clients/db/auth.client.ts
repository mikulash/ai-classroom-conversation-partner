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
import { profileDtoToModel } from '../../dtoToModelMappers';

const authApi = AuthApiFp();

export const authClient = {
  /**
   * Register a new user
   */
  register: async (payload: RegisterUserDto) => {
    try {
      const requestFn = await authApi.authControllerRegister(payload);
      const response = await requestFn(api);
      return { data: { message: response.data.message }, error: null };
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
      const requestFn = await authApi.authControllerVerifyEmail( token );
      const response = await requestFn(api);
      const { user: userDto, accessToken, refreshToken } = response.data;
      const user = profileDtoToModel(userDto);

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(user));

      return {
        data: { user, session: { access_token: accessToken, user } },
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

  resendVerificationEmail: async (payload: ResendVerificationDto) => {
    try {
      const requestFn = await authApi.authControllerResendVerification(payload);
      const response = await requestFn(api);
      return { data: { message: response.data.message }, error: null };
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
  login: async (email: string, password: string) => {
    try {
      const payload: LoginDto = { email, password };
      const requestFn = await authApi.authControllerLogin(payload);
      const response = await requestFn(api);
      const { user: userDto, accessToken, refreshToken } = response.data;
      const user = profileDtoToModel(userDto);

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(user));

      return {
        data: { user, session: { access_token: accessToken, user } },
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
      const requestFn = await authApi.authControllerMe();
      const response = await requestFn(api);
      const user = profileDtoToModel(response.data);

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
      if (!refreshToken) throw new Error('No refresh token available');

      const payload: RefreshTokenDto = { refreshToken };
      const requestFn = await authApi.authControllerRefresh(payload);
      const response = await requestFn(api);
      const { accessToken, refreshToken: newRefreshToken } = response.data;

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
        const payload: RefreshTokenDto = { refreshToken };
        const requestFn = await authApi.authControllerLogout(payload);
        await requestFn(api);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
      const payload: RequestPasswordResetDto = { email };
      const requestFn = await authApi.authControllerRequestPasswordReset(payload);
      await requestFn(api);
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
      const payload: ResetPasswordDto = { token, newPassword };
      const requestFn = await authApi.authControllerResetPassword(payload);
      await requestFn(api);
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
      const payload: UpdatePasswordDto = { currentPassword, newPassword };
      const requestFn = await authApi.authControllerUpdatePassword(payload);
      await requestFn(api);
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
