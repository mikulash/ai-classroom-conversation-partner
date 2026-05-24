import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';
import { profileClient } from '@repo/frontend-utils/src/clients/db/profile.client';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { ConversationModel, ProfileModel } from '@repo/frontend-utils/src/models';
import { UpdateProfileDto } from '@repo/frontend-utils/src/clients/generated';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import { useAuth } from '../useAuth';
import { unwrap } from './unwrap';

const currentUserKey = ['currentUser'] as const;
const myConversationsKey = ['conversations', 'mine'] as const;

/**
 * Fresh fetch of the authenticated user's profile.
 *
 * The session itself stays in `useAuth` (auth store, persisted), but the
 * fully-hydrated `ProfileModel` (including bio, role, etc.) lives here so
 * the profile page reads server truth and re-renders when it changes.
 *
 * Gated on `ready && !!session` so we never fire before auth is settled.
 */
export const useCurrentUserProfile = () => {
  const { ready, session, setProfile } = useAuth();

  return useQuery({
    queryKey: currentUserKey,
    queryFn: async () => {
      const data = unwrap(await authClient.getCurrentUser());
      // Keep the persisted auth store in sync so other consumers
      // (Header, ProtectedRoute) see the freshest profile.
      setProfile(data);
      return data;
    },
    enabled: ready && !!session,
    staleTime: 60_000,
  });
};

const toIsoString = (value: Date | string | null | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const toMyConversation = (conv: ConversationModel): MyConversation => ({
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
 * Current user's conversation history.
 * Same enable-gating as the profile query so it doesn't fire before auth.
 */
export const useMyConversations = () => {
  const { ready, session } = useAuth();

  return useQuery({
    queryKey: myConversationsKey,
    queryFn: async () => {
      const data = unwrap(await conversationClient.getCurrentUserConversations());
      return data.map(toMyConversation);
    },
    enabled: ready && !!session,
  });
};

/**
 * Helper for components that delete a conversation: patch it out of the
 * cached list without round-tripping.
 */
export const useRemoveMyConversationFromCache = () => {
  const queryClient = useQueryClient();
  return (conversationId: number) => {
    queryClient.setQueryData<MyConversation[]>(
      myConversationsKey,
      (prev) => prev?.filter((c) => c.id !== conversationId) ?? prev,
    );
  };
};

/**
 * Upsert the current user's profile. On success the auth store is
 * updated and the current-user query is invalidated.
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const { setProfile } = useAuth();

  return useMutation({
    mutationFn: ({ profileId, input }: { profileId: string; input: UpdateProfileDto }) =>
      profileClient.upsert(profileId, input).then(unwrap),
    onSuccess: (data: ProfileModel) => {
      setProfile(data);
      void queryClient.invalidateQueries({ queryKey: currentUserKey });
    },
  });
};
