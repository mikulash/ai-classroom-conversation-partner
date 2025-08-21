import { useEffect } from 'react';
import { useSession } from './useSession';
import { supabase } from '@repo/api-client/src/supabase';
import { useUserStore } from './useUserStore';


export const useProfile = () => {
  const { profile, setProfile, clearProfile } = useUserStore();
  const { session, ready } = useSession();

  useEffect(() => {
    if (!ready) return; // still checking auth
    if (!session) {
      clearProfile(); return;
    }

    // First page load (nothing cached)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setProfile(data);
      });
  }, [ready, session?.user.id]);

  return profile;
};
