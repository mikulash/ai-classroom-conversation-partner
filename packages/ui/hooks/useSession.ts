import { useEffect, useState } from 'react';
import { supabase } from '@repo/api-client/src/supabase';
import type { Session } from '@supabase/supabase-js';

/**
 * Returns the current Supabase auth session and keeps it in sync
 * with any future auth changes.
 */
export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true); // we have an answer
    });

    const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
              setSession(session);
              setReady(true); // already true after init
            });

    return () => subscription.unsubscribe();
  }, []);

  return { session, ready };
};
