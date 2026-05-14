import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { modelClient } from '@repo/frontend-utils/src/clients/db/model.client';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import {
  CustomSelectionWithModelsModel,
} from '@repo/frontend-utils/src/models';
import { ModelSelectionIdsDto } from '@repo/frontend-utils/src/clients/generated';
import { queryKeys } from './queryKeys';
import { unwrap } from './unwrap';
import { ModelOptionsWithAvailability } from '../../lib/types/modelSelection';
import {
  getAvailableRealtimeModels,
  getAvailableRealtimeTranscriptionModels,
  getAvailableResponseModels,
  getAvailableTimestampedTranscriptionModels,
  getAvailableTtsModels,
} from '../../lib/filterModelsByApiKeyStatus';

/**
 * Fetches every model list in parallel together with the AI providers'
 * availability status, then filters out unavailable options.
 *
 * One query is preferable to five separate `useQuery` calls here because
 * the result is meaningful only once *every* slice has loaded and been
 * filtered against the same availability snapshot. Five queries would
 * cause flicker as each piece arrives, plus duplicate availability fetches.
 */
export const useFilteredModelOptions = () => {
  return useQuery<ModelOptionsWithAvailability>({
    queryKey: queryKeys.models.options,
    queryFn: async () => {
      const [
        responseRes,
        ttsRes,
        realtimeRes,
        timestampedRes,
        realtimeTransRes,
        aiProvidersAvailability,
      ] = await Promise.all([
        modelClient.responseModels(),
        modelClient.ttsModels(),
        modelClient.realtimeModels(),
        modelClient.timestampedTranscriptionModels(),
        modelClient.realtimeTranscriptionModels(),
        repliesClient.getAiProvidersAvailability(),
      ]);

      const responseModels = unwrap(responseRes);
      const ttsModels = unwrap(ttsRes);
      const realtimeModels = unwrap(realtimeRes);
      const timestampedModels = unwrap(timestampedRes);
      const realtimeTransModels = unwrap(realtimeTransRes);

      return {
        responseModels: getAvailableResponseModels(aiProvidersAvailability, responseModels),
        ttsModels: getAvailableTtsModels(aiProvidersAvailability, ttsModels),
        realtimeModels: getAvailableRealtimeModels(aiProvidersAvailability, realtimeModels),
        timestampedTranscriptionModels: getAvailableTimestampedTranscriptionModels(
          aiProvidersAvailability,
          timestampedModels,
        ),
        realtimeTranscriptionModels: getAvailableRealtimeTranscriptionModels(
          aiProvidersAvailability,
          realtimeTransModels,
        ),
      };
    },
  });
};

export const useCustomModelSelection = (userId: string | undefined) =>
  useQuery<CustomSelectionWithModelsModel | null>({
    queryKey: queryKeys.models.customSelection(userId ?? ''),
    queryFn: () => modelClient.customModelSelection(userId ?? '').then(unwrap),
    enabled: !!userId,
  });

export const useUpsertCustomModelSelection = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ModelSelectionIdsDto) => {
      if (!userId) {
        throw new Error('Cannot save custom model selection without a userId');
      }
      return modelClient.upsertCustomModelSelection(userId, payload).then(unwrap);
    },
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.models.customSelection(userId),
        });
      }
    },
  });
};
