import React from 'react';
import { Button } from './ui/button';
import { TableCell, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Profile, UserRole } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { ConversationsList } from './ConversationsList';

interface Conversation {
    id: number;
    start_time: string;
    end_time: string;
    ended_reason: string;
    conversation_type: string;
    messages: ChatMessage[];
    personality_id: number | null;
    personality: {
        name: string;
    } | null;
}

interface UserProfileRowProps {
    profile: Profile;
    currentUserId?: string;
    isExpanded: boolean;
    isProcessing: boolean;
    conversations: Conversation[];
    isLoadingConversations: boolean;
    onToggleExpansion: (userId: string) => void;
    onRoleChange: (profileId: string, newRole: UserRole) => void;
    onConversationClick: (conversation: Conversation) => void;
    formatDate: (dateString: string) => string;
    formatDateTime: (dateString: string) => string;
}

export const UserProfileRow: React.FC<UserProfileRowProps> = ({
  profile,
  currentUserId,
  isExpanded,
  isProcessing,
  conversations,
  isLoadingConversations,
  onToggleExpansion,
  onRoleChange,
  onConversationClick,
  formatDate,
  formatDateTime,
}) => {
  const { t } = useTypedTranslation();
  const isCurrentUser = profile.id === currentUserId;

  return (
    <React.Fragment key={profile.id}>
      <TableRow className="cursor-pointer hover:bg-muted/50">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(profile.id)}
            className="p-0 h-8 w-8"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4"/>
            ) : (
              <ChevronRight className="h-4 w-4"/>
            )}
          </Button>
        </TableCell>
        <TableCell
          className="max-w-xs truncate cursor-pointer"
          onClick={() => onToggleExpansion(profile.id)}
        >
          {profile.email}
          {isCurrentUser && (
            <span className="ml-2 text-xs px-2 py-1 rounded border border-border/60 bg-accent text-accent-foreground">
              {t('you')}
            </span>
          )}
        </TableCell>
        <TableCell
          className="max-w-xs truncate cursor-pointer"
          onClick={() => onToggleExpansion(profile.id)}
        >
          {profile.full_name ?? '—'}
        </TableCell>
        <TableCell>
          <Select
            value={profile.user_role}
            onValueChange={(value: UserRole) => onRoleChange(profile.id, value)}
            disabled={isProcessing || isCurrentUser}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('admin.profiles.table.role')}/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">
                {t('admin.profiles.roles.basic')}
              </SelectItem>
              <SelectItem value="admin">
                {t('admin.profiles.roles.admin')}
              </SelectItem>
              <SelectItem value="owner">
                {t('admin.profiles.roles.owner')}
              </SelectItem>
            </SelectContent>
          </Select>
          {isCurrentUser && (
            <div className="text-xs text-muted-foreground mt-1">
              {t('admin.profiles.roles.cannotChangeOwnRole', { 'defaultValue': 'Cannot change your own role' })}
            </div>
          )}
        </TableCell>
        <TableCell className="text-right text-sm text-muted-foreground">
          {formatDate(profile.created_at)}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow>
          <TableCell colSpan={5} className="p-0">
            <div className="bg-muted/20 p-4">
              <ConversationsList
                conversations={conversations}
                isLoading={isLoadingConversations}
                onConversationClick={onConversationClick}
                formatDateTime={formatDateTime}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

