import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appConfigClient } from '@repo/frontend-utils/src/clients/db/appConfig.client';
import { ModelSelectionIdsDto } from '@repo/frontend-utils/src/clients/generated';
import { queryKeys } from './queryKeys';
import { unwrap } from './unwrap';
import { useAppStore } from '../useAppStore';

/**
 * Fetches the initial conversation options (personalities, scenarios,
 * conversation roles, app config) bundle that seeds the global Zustand
 * store at app start.
 *
 * Cached forever (`staleTime: Infinity`) because the payload is the
 * "boot snapshot" — a manual refetch is the right way to refresh it.
 * The Zustand store keeps existing consumers (chat selector, header)
 * working unchanged.
 */
export const useInitialConversationOptions = () => {
  const setOptions = useAppStore((state) => state.setInitialConversationOptions);

  const query = useQuery({
    queryKey: queryKeys.appConfig.initialOptions,
    queryFn: () => appConfigClient.fetchInitialConversationOptions(),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data) setOptions(query.data);
  }, [query.data, setOptions]);

  return query;
};

/**
 * Mutation that persists the global model selection.
 *
 * The current `appConfig` itself is owned by `useAppStore` (it's seeded
 * by `Layout.tsx` for the whole app). On success we both update the store
 * and invalidate the `appConfig` query key so any future RQ consumers
 * also pick up the change.
 */
export const useUpdateAppConfigModels = () => {
  const queryClient = useQueryClient();
  const setAppConfig = useAppStore((state) => state.setAppConfig);

  return useMutation({
    mutationFn: (payload: ModelSelectionIdsDto) =>
      appConfigClient.updateAppConfigModels(payload).then(unwrap),
    onSuccess: (data) => {
      setAppConfig(data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.appConfig.current });
    },
  });
};
