import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance used by the UI layer.
 *
 * Defaults:
 * - `staleTime: 30s` so admin list views don't refetch on every focus change.
 * - `retry: 1` on queries — the underlying clients already surface friendly errors,
 *   we don't want to mask transient failures with silent retries.
 * - Mutations retry: 0 (default) — never retry write operations.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
