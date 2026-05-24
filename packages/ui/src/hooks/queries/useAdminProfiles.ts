import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileClient } from '@repo/frontend-utils/src/clients/db/profile.client';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { ProfileModel } from '@repo/frontend-utils/src/models';
import { UserRole } from '@repo/frontend-utils/src/clients/generated';
import { mapConversation } from './mapConversation';
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
