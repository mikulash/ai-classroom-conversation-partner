import { useCallback, useState } from 'react';
import { supabase } from '@repo/api-client/src/supabase';
import { RegisterUserBody } from '@repo/shared/types/api/RegisterUserBody';
import { apiClient } from '@repo/api-client/src/figurantClient';
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
                await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      const { data: profile, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

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
    async (params: RegisterUserBody ) => {
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
    await supabase.auth.signOut();
    clearProfile();
  }, []);

  return { signIn, signUp, signOut, loading, error };
};
