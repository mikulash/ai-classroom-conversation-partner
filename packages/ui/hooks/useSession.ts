import { useEffect, useState } from 'react';
import { authApi } from '@repo/frontend-utils/src/apiService';

/**
 * Session type compatible with previous Supabase session
 */
export interface Session {
  access_token: string;
  user: any;
}

/**
 * Returns the current JWT auth session and keeps it in sync
 * with localStorage changes.
 */
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initial session check
    authApi.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
    });

    // Listen for auth state changes via onAuthStateChange
    const { data: { subscription } } =
            authApi.onAuthStateChange((_event, session) => {
              setSession(session);
              setReady(true);
            });

    // Listen for storage events (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      // Updated to use new localStorage keys
      if (e.key === 'access_token' || e.key === 'refresh_token' || e.key === 'user_profile') {
        authApi.getSession().then(({ data: { session } }) => {
          setSession(session);
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { session, ready };
};
