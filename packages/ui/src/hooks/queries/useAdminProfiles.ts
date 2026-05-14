import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileClient } from '@repo/frontend-utils/src/clients/db/profile.client';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { ConversationModel, ProfileModel } from '@repo/frontend-utils/src/models';
import { UserRole } from '@repo/frontend-utils/src/clients/generated';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import { queryKeys } from './queryKeys';
import { unwrap } from './unwrap';

export const useAdminProfiles = () =>
  useQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: () => profileClient.getAll().then(unwrap),
  });

export const useUpdateProfileRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, role }: { profileId: string; role: UserRole }) =>
      profileClient.updateRole(profileId, role).then(unwrap),
    onSuccess: (updated: ProfileModel) => {
      // Optimistic-style cache update: patch the existing list rather
      // than refetching everything, since `updateRole` returns the new row.
      queryClient.setQueryData<ProfileModel[]>(queryKeys.profiles.all, (prev) =>
        prev?.map((p) => (p.id === updated.id ? updated : p)) ?? prev,
      );
    },
  });
};

const toIsoString = (value: Date | string | null | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const mapConversation = (conv: ConversationModel): MyConversation => ({
  id: conv.id,
  start_time: toIsoString(conv.startTime),
  end_time: toIsoString(conv.endTime),
  ended_reason: conv.endedReason,
  conversation_type: conv.conversationType,
  messages: Array.isArray(conv.messages) ? (conv.messages as unknown as ChatMessage[]) : [],
  personality_id: conv.personalityId,
  personality: conv.personality ? { name: conv.personality.name } : null,
});

/**
 * Conversations for a single user. Driven by `enabled` so the query only
 * fires when the row is expanded — `useQuery` natively dedupes/cache so
 * re-expanding the same row never re-fetches.
 */
export const useUserConversations = (userId: string | undefined, enabled = false) =>
  useQuery({
    queryKey: queryKeys.conversations.byUser(userId ?? ''),
    queryFn: async () => {
      const data = unwrap(await conversationClient.getByUserId(userId ?? ''));
      return data.map(mapConversation);
    },
    enabled: enabled && !!userId,
  });

/**
 * Helper exposed so callers can drop a single conversation from cache
 * after it's been deleted, without round-tripping back to the server.
 */
export const useRemoveConversationFromCache = () => {
  const queryClient = useQueryClient();
  return (userId: string, conversationId: number) => {
    queryClient.setQueryData<MyConversation[]>(
      queryKeys.conversations.byUser(userId),
      (prev) => prev?.filter((c) => c.id !== conversationId) ?? prev,
    );
  };
};
