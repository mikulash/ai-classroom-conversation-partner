import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ConversationTranscriptDialog } from '../../components/ConversationTranscriptDialog';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import { UserRole } from '@repo/frontend-utils/src/clients/generated';
import {
  useAdminProfiles,
  useRemoveConversationFromCache,
  useUpdateProfileRole,
} from '../../hooks/queries/useAdminProfiles';
import { queryKeys } from '../../hooks/queries/queryKeys';
import { ProfileConversationsRow } from '../../components/admin/ProfileConversationsRow';

export function AdminProfilesPage() {
  const { t } = useTypedTranslation();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const profilesQuery = useAdminProfiles();
  const updateRole = useUpdateProfileRole();
  const removeConversationFromCache = useRemoveConversationFromCache();

  const [search, setSearch] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [isConversationDialogVisible, setIsConversationDialogVisible] = useState(false);

  const profiles = profilesQuery.data ?? [];

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter((p) =>
      p.email.toLowerCase().includes(term) ||
      p.fullName.toLowerCase().includes(term),
    );
  }, [profiles, search]);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleConversationClick = (conversation: MyConversation) => {
    setSelectedConversation(conversation);
    setIsConversationDialogVisible(true);
  };

  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    try {
      await updateRole.mutateAsync({ profileId, role: newRole });
      toast.success(t('admin.profiles.notifications.updateSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      toast.error(t('admin.profiles.notifications.updateFailed'), { description: message });
    }
  };

  const handleConversationDeleted = () => {
    if (!selectedConversation) return;
    // Find which user's cached list this conversation belongs to and patch it.
    for (const userId of expandedUsers) {
      const conversations = queryClient.getQueryData<MyConversation[]>(
        queryKeys.conversations.byUser(userId),
      );
      if (conversations?.some((c) => c.id === selectedConversation.id)) {
        removeConversationFromCache(userId, selectedConversation.id);
        break;
      }
    }
    setSelectedConversation(null);
  };

  if (!profile) {
    return null;
  }

  if (profilesQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">{t('loading.profiles')}</span>
      </div>
    );
  }

  if (profilesQuery.isError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-destructive">
          {t('admin.profiles.notifications.loadFailed')}: {profilesQuery.error.message}
        </span>
      </div>
    );
  }

  return (
    <>
      <Card className="mx-auto mb-8 max-w-6xl p-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{t('admin.profiles.title')}</CardTitle>

          <div className="flex w-full max-w-md items-center gap-2 sm:w-auto">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder={t('admin.profiles.searchPlaceholder')}
            />
            <Button
              variant="outline"
              onClick={() => {
                void profilesQuery.refetch();
              }}
              disabled={profilesQuery.isFetching}
            >
              {t('admin.profiles.refresh')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>{t('admin.profiles.table.email')}</TableHead>
                <TableHead>{t('admin.profiles.table.name')}</TableHead>
                <TableHead>{t('admin.profiles.table.role')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.profiles.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {t('admin.profiles.noProfiles')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((p) => (
                  <ProfileConversationsRow
                    key={p.id}
                    profile={p}
                    currentUserId={profile.id}
                    isExpanded={expandedUsers.has(p.id)}
                    isProcessing={updateRole.isPending}
                    onToggleExpansion={toggleUserExpansion}
                    onRoleChange={(profileId, role) => {
                      void handleRoleChange(profileId, role);
                    }}
                    onConversationClick={handleConversationClick}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConversationTranscriptDialog
        isOpen={isConversationDialogVisible}
        onOpenChange={setIsConversationDialogVisible}
        messages={selectedConversation?.messages ?? []}
        personalityName={selectedConversation?.personality?.name ?? 'Unknown'}
        mode="admin"
        conversationMetadata={selectedConversation ? {
          conversationType: selectedConversation.conversation_type,
          startTime: selectedConversation.start_time,
          endTime: selectedConversation.end_time,
          endedReason: selectedConversation.ended_reason,
        } : undefined}
        conversationId={selectedConversation?.id}
        onConversationDeleted={handleConversationDeleted}
        isDeleteAllowed={true}
      />
    </>
  );
}
