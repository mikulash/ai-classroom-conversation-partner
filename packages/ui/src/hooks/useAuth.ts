import { useCallback } from 'react';
import { ProfileModel } from '@repo/frontend-utils/src/models';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';
import { RegisterUserDto } from '@repo/frontend-utils/src/clients/generated';


export interface Session {
  access_token: string;
  user: ProfileModel;
}

interface AuthStoreState {
  session: Session | null;
  ready: boolean;
  loading: boolean;
  error: string | null;
  profile: ProfileModel | null;
  setProfile: (profile: ProfileModel) => void;
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
      setProfile: (profile) => {
        set({ profile });
      },
      clearProfile: () => {
        set({ profile: null });
      },
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
  try {
    const accessToken = globalThis.localStorage.getItem('access_token');
    const userStr = globalThis.localStorage.getItem('user_profile');

    if (!accessToken || !userStr) {
      return null;
    }

    const user = JSON.parse(userStr) as ProfileModel;
    return {
      access_token: accessToken,
      user,
    };
  } catch {
    return null;
  }
};

const fetchSessionFromStorage = () => {
  try {
    const session = readSessionFromStorage();
    syncSessionWithStores(session);
  } finally {
    setAuthState({ ready: true });
  }
};

// Track the registered listener on a global so HMR module reloads can
// detach the previous handler before installing a new one. Without this,
// every Vite HMR update would stack another `storage` listener.
const STORAGE_HANDLER_KEY = '__aiConvPartnerAuthStorageHandler';

interface GlobalWithAuthHandler {
  [STORAGE_HANDLER_KEY]?: (event: StorageEvent) => void;
}

const initializeAuthSync = () => {
  const globalRef = globalThis as unknown as GlobalWithAuthHandler;

  const prior = globalRef[STORAGE_HANDLER_KEY];
  if (prior) {
    globalThis.removeEventListener('storage', prior);
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (!shouldSyncForKey(event.key)) return;
    fetchSessionFromStorage();
  };

  globalRef[STORAGE_HANDLER_KEY] = handleStorageChange;
  globalThis.addEventListener('storage', handleStorageChange);

  fetchSessionFromStorage();
};

// Run sync at module load — avoids tying initialization to component mount,
// where it would re-fire under StrictMode and cause render-time churn.
initializeAuthSync();

export const useAuth = () => {
  const session = useAuthStore((state) => state.session);
  const ready = useAuthStore((state) => state.ready);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const clearProfile = useAuthStore((state) => state.clearProfile);

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState({ loading: true, error: null });

    const { data, error: authError } = await authClient.login(email, password);

    if (authError) {
      setAuthState({ error: authError.message, loading: false });
      return false;
    }


    syncSessionWithStores(data.session);
    setAuthState({ ready: true, loading: false });
    return !!data.session;
  }, []);

  const signUp = useCallback(async (params: RegisterUserDto) => {
    setAuthState({ loading: true, error: null });

    const { error: authError } = await authClient.register({
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
    await authClient.signOut();
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
