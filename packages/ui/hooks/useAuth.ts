import { useCallback, useState } from 'react';
import { authApi, profileApi } from '@repo/api-client/src/supabaseService';
import { RegisterUserRequest } from '@repo/shared/types/api/RegisterUserRequest';
import { apiClient } from '@repo/api-client/src/clients/figurantClient';
import { useUserStore } from './useUserStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProfile, clearProfile } = useUserStore();

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const { data, error } =
                await authApi.signInWithPassword(email, password);

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      const { data: profile, error: pError } = await profileApi.getById(
        data.user.id,
      );

      if (pError) {
        setError(pError.message);
        return false;
      }

      console.log('[signIn] profile:', profile);

      setProfile(profile);


      setLoading(false);
      return !!data.session;
    },
    [],
  );

  const signUp = useCallback(
    async (params: RegisterUserRequest ) => {
      setLoading(true);
      setError(null);

      const res = await apiClient.registerUser(params);

      if (typeof res === 'string') {
        setError(res);
      } else if (res.error) {
        setError(res.error.message);
      }

      console.log('[signUp] res:', res);

      setLoading(false);
    },
    [],
  );


  const signOut = useCallback(async () => {
    await authApi.signOut();
    clearProfile();
  }, []);

  return { signIn, signUp, signOut, loading, error };
};
