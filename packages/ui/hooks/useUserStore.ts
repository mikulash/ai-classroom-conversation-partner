import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Profile } from '@repo/shared/types/supabase/supabaseTypeHelpers';

interface UserSlice {
    profile: Profile | null
    setProfile: (u: Profile) => void
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
