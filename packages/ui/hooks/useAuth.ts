import { useCallback, useEffect } from 'react';
import { authApi } from '@repo/frontend-utils/src/apiService';
import { useUserStore } from './useUserStore';
import { RegisterUserRequest } from '@repo/shared/types/api';
import { create } from 'zustand';

/**
 * Session type compatible with previous Supabase session implementation.
 */
export interface Session {
  access_token: string;
  user: any;
}

interface AuthStoreState {
    session: Session | null;
    ready: boolean;
    loading: boolean;
    error: string | null;
}

const useAuthStore = create<AuthStoreState>(() => ({
  session: null,
  ready: false,
  loading: false,
  error: null,
}));

const setAuthState = (partial: Partial<AuthStoreState>) => {
  useAuthStore.setState(partial);
};

const syncSessionWithStores = (newSession: Session | null) => {
  setAuthState({ session: newSession });
  const { setProfile, clearProfile } = useUserStore.getState();

  if (newSession?.user) {
    setProfile(newSession.user);
  } else {
    clearProfile();
  }
};

const shouldSyncForKey = (key: string | null) =>
  key === 'access_token' || key === 'refresh_token' || key === 'user_profile';

const fetchSessionFromStorage = async () => {
  try {
    const { data } = await authApi.getSession();
    syncSessionWithStores(data.session);
  } catch {
    syncSessionWithStores(null);
  } finally {
    setAuthState({ ready: true });
  }
};

let hasInitializedAuth = false;

const initializeAuthSync = () => {
  if (hasInitializedAuth || typeof window === 'undefined') {
    return;
  }

  hasInitializedAuth = true;
  void fetchSessionFromStorage();

  const handleStorageChange = (event: StorageEvent) => {
    if (!shouldSyncForKey(event.key)) {
      return;
    }

    void fetchSessionFromStorage();
  };

  window.addEventListener('storage', handleStorageChange);
};

export const useAuth = () => {
  const session = useAuthStore((state) => state.session);
  const ready = useAuthStore((state) => state.ready);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    initializeAuthSync();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState({ loading: true, error: null });

    const { data, error: authError } = await authApi.signInWithPassword(email, password);

    if (authError) {
      setAuthState({ error: authError.message, loading: false });
      return false;
    }

    syncSessionWithStores(data.session ?? null);
    setAuthState({ ready: true, loading: false });
    return !!data.session;
  }, []);

  const signUp = useCallback(async (params: RegisterUserRequest) => {
    setAuthState({ loading: true, error: null });

    const { data, error: authError } = await authApi.register({
      email: params.email,
      password: params.password,
      fullName: params.fullName,
      gender: params.gender,
    });

    if (authError) {
      setAuthState({ error: authError.message, loading: false });
      return false;
    }

    syncSessionWithStores(data.session ?? null);
    setAuthState({ ready: true, loading: false });
    return true;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    syncSessionWithStores(null);
    setAuthState({ error: null });
  }, []);

  return {
    session,
    ready,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };
};
