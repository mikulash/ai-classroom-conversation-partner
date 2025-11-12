import { useCallback, useEffect } from 'react';
import { ProfileResponse, RegisterUserRequest } from '@repo/shared/types/api';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authApi } from '@repo/frontend-utils/src/clients/db/auth';


export interface Session {
  access_token: string;
  user: any;
}

interface AuthStoreState {
    session: Session | null;
    ready: boolean;
    loading: boolean;
    error: string | null;
    profile: ProfileResponse | null;
    setProfile: (profile: ProfileResponse) => void;
    clearProfile: () => void;
}

const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      session: null,
      ready: false,
      loading: false,
      error: null,
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);

const setAuthState = (partial: Partial<AuthStoreState>) => {
  useAuthStore.setState(partial);
};

const syncSessionWithStores = (newSession: Session | null) => {
  setAuthState({ session: newSession });
  const { setProfile, clearProfile } = useAuthStore.getState();

  if (newSession?.user) {
    setProfile(newSession.user);
  } else {
    clearProfile();
  }
};

const shouldSyncForKey = (key: string | null) =>
  key === 'access_token' || key === 'refresh_token' || key === 'user_profile';

const readSessionFromStorage = (): Session | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const accessToken = window.localStorage.getItem('access_token');
    const userStr = window.localStorage.getItem('user_profile');

    if (!accessToken || !userStr) {
      return null;
    }

    const user = JSON.parse(userStr);
    return {
      access_token: accessToken,
      user,
    };
  } catch {
    return null;
  }
};

const fetchSessionFromStorage = async () => {
  try {
    const session = readSessionFromStorage();
    syncSessionWithStores(session);
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
  const {
    session,
    ready,
    loading,
    error,
    profile,
    setProfile,
    clearProfile,
  } = useAuthStore();

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

    const { error: authError } = await authApi.register({
      email: params.email,
      password: params.password,
      fullName: params.fullName,
      gender: params.gender,
    });

    if (authError) {
      setAuthState({ error: authError.message, loading: false });
      return false;
    }

    // Registration should not automatically sign the user in. They must verify their email first.
    setAuthState({ loading: false });
    return true;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    syncSessionWithStores(null);
    setAuthState({ error: null });
  }, []);

  const applySession = useCallback((newSession: Session | null) => {
    syncSessionWithStores(newSession);
    setAuthState({ ready: true, loading: false, error: null });
  }, []);

  return {
    session,
    ready,
    profile,
    setProfile,
    clearProfile,
    signIn,
    signUp,
    signOut,
    applySession,
    loading,
    error,
  };
};
