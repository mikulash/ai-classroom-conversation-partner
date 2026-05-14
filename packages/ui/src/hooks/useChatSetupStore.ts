import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';

export interface ChatSetup {
  personality: PersonalityModel;
  conversationRoleName: string;
  scenario: ScenarioModel | null;
}

interface ChatSetupState {
  setup: ChatSetup | null;
  setSetup: (setup: ChatSetup) => void;
  clearSetup: () => void;
}

/**
 * Holds the personality/role/scenario the user picked on
 * the selector page and carries it into the chat pages.
 *
 * Persisted to sessionStorage so a page refresh on `/chat/voice-call`
 * (etc.) does NOT drop the user back to the selector — which is what
 * happens when this data lives in `location.state`.
 *
 * sessionStorage (not localStorage) so the setup is scoped to the tab
 * and doesn't leak across windows the user views in parallel.
 */
export const useChatSetupStore = create<ChatSetupState>()(
  persist(
    (set) => ({
      setup: null,
      setSetup: (setup) => {
        set({ setup });
      },
      clearSetup: () => {
        set({ setup: null });
      },
    }),
    {
      name: 'chat-setup',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
