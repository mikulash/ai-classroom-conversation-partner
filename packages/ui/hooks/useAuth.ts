import { useCallback, useState } from 'react';
import { authApi } from '@repo/frontend-utils/src/apiService';
import { api } from '@repo/frontend-utils/src/apiService';
import { useUserStore } from './useUserStore';
import { RegisterUserRequest } from '@repo/shared/types/apiFigurantClient';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProfile, clearProfile } = useUserStore();

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const { data, error: authError } =
                await authApi.signInWithPassword(email, password);

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return false;
      }

      console.log('[signIn] user:', data.user);

      // User profile is already included in the auth response
      setProfile(data.user);

      setLoading(false);
      return !!data.session;
    },
    [],
  );

  const signUp = useCallback(
    async (params: RegisterUserRequest) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/api/auth/register', params);

        const { user, token } = response.data;

        // Store token and user
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_profile', JSON.stringify(user));

        setProfile(user);
        setLoading(false);
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        setError(errorMessage);
        setLoading(false);
        return false;
      }
    },
    [],
  );


  const signOut = useCallback(async () => {
    await authApi.signOut();
    clearProfile();
  }, []);

  return { signIn, signUp, signOut, loading, error };
};
