import axios, { AxiosInstance } from 'axios';
import {
  AdminUserCustomModelSelection,
  AppConfig,
  Conversation, ConversationCreate,
  ConversationRole,
  Personality, PersonalityCreate,
  Profile,
  RealtimeModel,
  RealtimeTranscriptionModel,
  ResponseModel,
  Scenario, ScenarioCreate,
  TimestampedTranscriptionModel,
  TtsModel,
} from '@repo/shared/types/db/entities';

import { UserRole } from '@repo/shared/types/db/enums';

export type ConversationWithPersonality = Pick<
    Conversation,
    | 'id'
    | 'startTime'
    | 'endTime'
    | 'endedReason'
    | 'conversationType'
    | 'messages'
    | 'personalityId'
> & { personality: { name: string } | null };

// API Response types
interface AuthResponse {
    user: Profile;
    accessToken: string;
    refreshToken: string;
}

interface ApiResponse<T> {
    data: T;
    error?: { message: string };
}

interface RegisterPayload {
    email: string;
    password: string;
    fullName?: string;
    gender?: string;
}

// Track if we're currently refreshing to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add subscribers to queue while refreshing
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when refresh completes
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor to handle token refresh on 401
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh endpoint
          const response = await axios.post(`${baseURL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Update authorization header
          client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Notify all queued requests
          onRefreshed(accessToken);
          isRefreshing = false;

          // Retry the original request
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_profile');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
};

const api = createApiClient();

interface InitialData {
    personalities: Personality[];
    scenarios: Scenario[];
    conversationRoles: ConversationRole[];
    appConfig: AppConfig;
}

// -------------------- Initial Data Fetch --------------------
export async function fetchInitialData(): Promise<InitialData> {
  try {
    const [personalities, scenarios, conversationRoles, appConfig] = await Promise.all([
      api.get<Personality[]>('/api/personalities'),
      api.get<Scenario[]>('/api/scenarios'),
      api.get<ConversationRole[]>('/api/conversation-roles'),
      api.get<AppConfig>('/api/app-config'),
    ]);


    return {
      personalities: personalities.data,
      scenarios: scenarios.data,
      conversationRoles: conversationRoles.data,
      appConfig: appConfig.data,
    };
  } catch (error: any) {
    console.error('Error fetching initial data:', error);
    throw error;
  }
}

// -------------------- Auth API --------------------
export const authApi = {
  /**
     * Get current session from localStorage
     */
  getSession: async () => {
    const accessToken = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user_profile');

    if (!accessToken || !userStr) {
      return { data: { session: null }, error: null };
    }

    try {
      const user = JSON.parse(userStr);
      return {
        data: {
          session: {
            access_token: accessToken,
            user,
          },
        },
        error: null,
      };
    } catch {
      return { data: { session: null }, error: null };
    }
  },

  /**
     * Register a new user
     */
  register: async (payload: RegisterPayload) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', payload);

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
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.response?.data?.message || 'Registration failed' },
      };
    }
  },

  /**
     * Sign in with email and password
     */
  signInWithPassword: async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      });

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
    } catch (error: any) {
      return {
        data: { user: null, session: null },
        error: { message: error.response?.data?.message || 'Login failed' },
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
        // Call backend to revoke refresh token
        await api.post('/api/auth/logout', { refreshToken });
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
     * Sign out from all devices
     */
  signOutAllDevices: async () => {
    try {
      await api.post('/api/auth/logout-all');

      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');

      return { error: null };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.message || 'Failed to logout from all devices' },
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

      const response = await api.post<{ accessToken: string; refreshToken: string }>(
        '/api/auth/refresh',
        { refreshToken },
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);

      return { data: { accessToken }, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Token refresh failed' },
      };
    }
  },

  /**
     * Get current user profile from backend
     */
  getCurrentUser: async () => {
    try {
      const response = await api.get<Profile>('/api/auth/me');
      const user = response.data;

      // Update stored user profile
      localStorage.setItem('user_profile', JSON.stringify(user));

      return { data: user, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch user profile' },
      };
    }
  },

  /**
     * Reset password for email
     * Note: This needs to be implemented on the backend
     */
  resetPasswordForEmail: async (email: string, redirectTo?: string) => {
    // TODO: Implement password reset on backend
    console.warn('Password reset not implemented yet');
    return {
      data: null,
      error: { message: 'Password reset not implemented yet' },
    };
  },

  /**
     * Update password
     */
  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      await api.put('/api/auth/password', {
        currentPassword,
        newPassword,
      });
      return { data: null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Password update failed' },
      };
    }
  },

  /**
     * Auth state change listener (for compatibility)
     * In JWT-based auth, we don't have real-time updates, but we can check periodically
     */
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    // Check initial state
    authApi.getSession().then(({ data }) => {
      callback('INITIAL_SESSION', data.session);
    });

    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // No-op for JWT-based auth
          },
        },
      },
    };
  },
};

// -------------------- Profile API --------------------
export const profileApi = {
  getById: async (id: string): Promise<ApiResponse<Profile>> => {
    try {
      const response = await api.get<Profile>(`/api/profiles/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: { message: error.response?.data?.message || 'Failed to fetch profile' } };
    }
  },

  getAll: async (): Promise<ApiResponse<Profile[]>> => {
    try {
      const response = await api.get<Profile[]>('/api/profiles');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch profiles' } };
    }
  },

  upsert: async (payload: Profile): Promise<ApiResponse<Profile>> => {
    try {
      const response = await api.put<Profile>(`/api/profiles/${payload.id}`, payload);
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: { message: error.response?.data?.message || 'Failed to update profile' } };
    }
  },

  updateRole: async (profileId: string, role: UserRole): Promise<ApiResponse<Profile>> => {
    try {
      const response = await api.put<Profile>(`/api/profiles/${profileId}/role`, {
        userRole: role,
      });
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: { message: error.response?.data?.message || 'Failed to update role' } };
    }
  },
};

// -------------------- Conversation API --------------------
export const conversationApi = {
  byUser: async (userId: string): Promise<ApiResponse<ConversationWithPersonality[]>> => {
    try {
      const response = await api.get<ConversationWithPersonality[]>('/api/conversations');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch conversations' } };
    }
  },

  insert: async (conversation: ConversationCreate): Promise<ApiResponse<Conversation>> => {
    try {
      const response = await api.post<Conversation>('/api/conversations', conversation);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to create conversation' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete<{ message: string }>(`/api/conversations/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to delete conversation' },
      };
    }
  },
};

// -------------------- Personality API --------------------
export const personalityApi = {
  all: async (): Promise<ApiResponse<Personality[]>> => {
    try {
      const response = await api.get<Personality[]>('/api/personalities');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch personalities' } };
    }
  },

  insert: async (personality: PersonalityCreate): Promise<ApiResponse<Personality>> => {
    try {
      const response = await api.post<Personality>('/api/personalities', personality);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to create personality' },
      };
    }
  },

  update: async (id: number, personality: Partial<Personality>): Promise<ApiResponse<Personality>> => {
    try {
      const response = await api.put<Personality>(`/api/personalities/${id}`, personality);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to update personality' },
      };
    }
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete<{ message: string }>(`/api/personalities/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to delete personality' },
      };
    }
  },
};

// -------------------- Scenario API --------------------
export const scenarioApi = {
  all: async (): Promise<ApiResponse<Scenario[]>> => {
    try {
      const response = await api.get<Scenario[]>('/api/scenarios');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch scenarios' } };
    }
  },

  insert: async (scenario: ScenarioCreate): Promise<ApiResponse<Scenario>> => {
    try {
      const response = await api.post<Scenario>('/api/scenarios', scenario);
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: { message: error.response?.data?.message || 'Failed to create scenario' } };
    }
  },

  update: async (id: number, scenario: Scenario): Promise<ApiResponse<Scenario>> => {
    try {
      const response = await api.put<Scenario>(`/api/scenarios/${id}`, scenario);
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: { message: error.response?.data?.message || 'Failed to update scenario' } };
    }
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete<{ message: string }>(`/api/scenarios/${id}`);
      return { data: response.data };
    } catch (error: any) {
      return { data: null as any, error: { message: error.response?.data?.message || 'Failed to delete scenario' } };
    }
  },
};

// -------------------- Model API --------------------
export const modelApi = {
  responseModels: async (): Promise<ApiResponse<ResponseModel[]>> => {
    try {
      const response = await api.get<ResponseModel[]>('/api/models/response');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch response models' } };
    }
  },

  ttsModels: async (): Promise<ApiResponse<TtsModel[]>> => {
    try {
      const response = await api.get<TtsModel[]>('/api/models/tts');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch TTS models' } };
    }
  },

  realtimeModels: async (): Promise<ApiResponse<RealtimeModel[]>> => {
    try {
      const response = await api.get<RealtimeModel[]>('/api/models/realtime');
      return { data: response.data };
    } catch (error: any) {
      return { data: [], error: { message: error.response?.data?.message || 'Failed to fetch realtime models' } };
    }
  },

  timestampedTranscriptionModels: async (): Promise<ApiResponse<TimestampedTranscriptionModel[]>> => {
    try {
      const response = await api.get<TimestampedTranscriptionModel[]>('/api/models/timestamped-transcription');
      return { data: response.data };
    } catch (error: any) {
      return {
        data: [],
        error: { message: error.response?.data?.message || 'Failed to fetch transcription models' },
      };
    }
  },

  realtimeTranscriptionModels: async (): Promise<ApiResponse<RealtimeTranscriptionModel[]>> => {
    try {
      const response = await api.get<RealtimeTranscriptionModel[]>('/api/models/realtime-transcription');
      return { data: response.data };
    } catch (error: any) {
      return {
        data: [],
        error: { message: error.response?.data?.message || 'Failed to fetch realtime transcription models' },
      };
    }
  },

  adminUserSelection: async (userId: string): Promise<ApiResponse<AdminUserCustomModelSelection>> => {
    try {
      const response = await api.get<AdminUserCustomModelSelection>(`/api/models/admin-selection/${userId}`);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to fetch admin selection' },
      };
    }
  },

  upsertAdminUserSelection: async (userId: string, payload: Partial<AdminUserCustomModelSelection>): Promise<ApiResponse<AdminUserCustomModelSelection>> => {
    try {
      const response = await api.put<AdminUserCustomModelSelection>(`/api/models/admin-selection/${userId}`, payload);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to update admin selection' },
      };
    }
  },

  updateAppConfigModels: async (payload: Partial<AppConfig>): Promise<ApiResponse<AppConfig>> => {
    try {
      const response = await api.put<AppConfig>('/api/app-config', payload);
      return { data: response.data };
    } catch (error: any) {
      return {
        data: null as any,
        error: { message: error.response?.data?.message || 'Failed to update app config' },
      };
    }
  },
};

// Export types
export type { RegisterPayload, AuthResponse };

// Export API client for direct use if needed
export { api };
