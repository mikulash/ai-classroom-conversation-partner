/**
 * Central registry of TanStack Query keys.
 *
 * Using a factory rather than scattering string literals makes
 * `queryClient.invalidateQueries({ queryKey: queryKeys.personalities.all })`
 * type-safe and refactor-friendly.
 */
export const queryKeys = {
  personalities: {
    all: ['personalities'] as const,
  },
  scenarios: {
    all: ['scenarios'] as const,
  },
  appConfig: {
    current: ['appConfig'] as const,
    initialOptions: ['appConfig', 'initialOptions'] as const,
  },
  models: {
    options: ['models', 'options'] as const,
    customSelection: (userId: string) => ['models', 'customSelection', userId] as const,
  },
  profiles: {
    all: ['profiles', 'all'] as const,
  },
  conversations: {
    byUser: (userId: string) => ['conversations', 'byUser', userId] as const,
  },
} as const;
