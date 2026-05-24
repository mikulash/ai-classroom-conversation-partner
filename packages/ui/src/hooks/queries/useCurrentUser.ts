import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { profileClient } from '@repo/frontend-utils/src/clients/db/profile.client';
import { UpdateProfileDto } from '@repo/frontend-utils/src/clients/generated';
import { ProfileModel } from '@repo/frontend-utils/src/models';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import { useAuth } from '../useAuth';
import { mapConversation } from './mapConversation';
import { queryKeys } from './queryKeys';
import { unwrap } from './unwrap';

/**
 * Fetches the signed-in user's full profile and mirrors it into the auth
 * store so other consumers (Header, ProtectedRoute, etc.) stay in sync.
 */
export const useCurrentUserProfile = () => {
  const { session, ready, setProfile } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.currentUser.profile,
    queryFn: () => authClient.getCurrentUser().then(unwrap),
    enabled: ready && !!session,
  });

  useEffect(() => {
    if (query.data) {
      setProfile(query.data);
    }
  }, [query.data, setProfile]);

  return query;
};

export const useCurrentUserConversations = () => {
  const { session, ready } = useAuth();

  return useQuery({
    queryKey: queryKeys.conversations.currentUser,
    queryFn: async () => {
      const data = unwrap(await conversationClient.getCurrentUserConversations());
      return data.map(mapConversation);
    },
    enabled: ready && !!session,
  });
};

/**
 * Deletes a conversation and patches every cached conversation list (current
 * user + per-user admin lists) so the row disappears without round-tripping.
 */
export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => conversationClient.delete(id).then(unwrap),
    onSuccess: (_data, deletedId) => {
      queryClient.setQueriesData<MyConversation[]>(
        { queryKey: queryKeys.conversations.all },
        (prev) => prev?.filter((c) => c.id !== deletedId) ?? prev,
      );
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useAuth();

  return useMutation({
    mutationFn: ({ profileId, payload }: { profileId: string; payload: UpdateProfileDto }) =>
      profileClient.upsert(profileId, payload).then(unwrap),
    onSuccess: (data: ProfileModel) => {
      setProfile(data);
      queryClient.setQueryData<ProfileModel>(queryKeys.currentUser.profile, data);
    },
  });
};
