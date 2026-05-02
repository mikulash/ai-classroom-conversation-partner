import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
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
  refreshSubscribers.forEach((callback) => {
    callback(token);
  });
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
    (error: Error) => {
      throw error;
    },
  );

  // Response interceptor to handle token refresh on 401
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
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

        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_profile');
          throw new Error('No refresh token available');
        }

        try {
          // Call refresh endpoint
          const response = await axios.post<RefreshTokenResponse>(`${baseURL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Update authorization header
          client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Notify all queued requests
          onRefreshed(accessToken);
          isRefreshing = false;

          // Retry the original request
          return await client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_profile');
          throw refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        }
      }

      throw error;
    },
  );

  return client;
};

const api = createApiClient();

export { api };
