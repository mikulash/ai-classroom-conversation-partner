import { useEffect } from 'react';
import { useSession } from './useSession';
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

    // Profile is already set from session.user
    // session.user contains the full profile from JWT auth
    if (session.user && !profile) {
      setProfile(session.user);
    }
  }, [ready, session?.user]);

  return profile;
};
