import React from 'react';
import { ProfileModel } from '@repo/frontend-utils/src/models';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import { UserRole } from '@repo/frontend-utils/src/clients/generated';
import { UserProfileRow } from '../UserProfileRow';
import { useUserConversations } from '../../hooks/queries/useAdminProfiles';

interface ProfileConversationsRowProps {
  profile: ProfileModel;
  currentUserId?: string;
  isExpanded: boolean;
  isProcessing: boolean;
  onToggleExpansion: (userId: string) => void;
  onRoleChange: (profileId: string, newRole: UserRole) => void;
  onConversationClick: (conversation: MyConversation) => void;
}

/**
 * Per-row wrapper that drives a `useUserConversations` query.
 *
 * Lifting the query down to the row means each row owns its own cache slot
 * keyed by userId. React Query handles dedupe, so re-expanding a row is free.
 * The query is gated by `isExpanded` so collapsed rows never fetch.
 */
export const ProfileConversationsRow: React.FC<ProfileConversationsRowProps> = ({
  profile,
  isExpanded,
  ...rest
}) => {
  const conversationsQuery = useUserConversations(profile.id, isExpanded);

  return (
    <UserProfileRow
      profile={profile}
      isExpanded={isExpanded}
      conversations={conversationsQuery.data ?? []}
      isLoadingConversations={conversationsQuery.isLoading && isExpanded}
      {...rest}
    />
  );
};
