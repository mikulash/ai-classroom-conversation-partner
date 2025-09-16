import { useEffect } from 'react';
import { useSession } from './useSession';
import { profileApi } from '@repo/frontend-utils/src/supabaseService';
import { useUserStore } from './useUserStore';


export const useProfile = () => {
  const { profile, setProfile, clearProfile } = useUserStore();
  const { session, ready } = useSession();

  useEffect(() => {
    if (!ready) return; // still checking auth
    if (!session) {
      clearProfile();
      return;
    }

    // First page load (nothing cached)
    profileApi
      .getById(session.user.id)
      .then(({ data, error }) => {
        if (!error && data) setProfile(data);
      });
  }, [ready, session?.user.id]);

  return profile;
};
