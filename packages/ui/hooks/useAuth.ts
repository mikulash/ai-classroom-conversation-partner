import { useCallback, useState } from 'react';
import { authApi } from '@repo/frontend-utils/src/apiService';
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
      // Tokens are automatically stored in localStorage by authApi
      setProfile(data.user);

      setLoading(false);
      return !!data.session;
    },
    [setProfile],
  );

  const signUp = useCallback(
    async (params: RegisterUserRequest) => {
      setLoading(true);
      setError(null);

      // Map RegisterUserRequest to RegisterPayload
      const { data, error: authError } = await authApi.register({
        email: params.email,
        password: params.password,
        fullName: params.full_name,
        gender: params.gender,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return false;
      }

      console.log('[signUp] user:', data.user);

      // User profile is already included in the auth response
      // Tokens are automatically stored in localStorage by authApi
      setProfile(data.user);

      setLoading(false);
      return true;
    },
    [setProfile],
  );

  const signOut = useCallback(async () => {
    await authApi.signOut();
    clearProfile();
  }, [clearProfile]);

  return { signIn, signUp, signOut, loading, error };
};
