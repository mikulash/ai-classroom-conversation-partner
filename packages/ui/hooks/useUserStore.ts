import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ProfileResponse } from '@repo/shared/types/api';

interface UserSlice {
    profile: ProfileResponse | null
    setProfile: (u: ProfileResponse) => void
    clearProfile: () => void
}

export const useUserStore = create<UserSlice>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile', // key in sessionStorage
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
