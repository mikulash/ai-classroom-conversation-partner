import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { supabase } from '@repo/api-client/src/supabase';
import { toast } from 'sonner';
import { Profile, UserRole } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { useProfile } from '../../hooks/useProfile';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { ConversationTranscriptDialog } from '../../components/ConversationTranscriptDialog';
import { MyConversation } from '@repo/shared/types/myConversation';
import { UserProfileRow } from '../../components/UserProfileRow';


export function AdminProfilesPage() {
  const { t } = useTypedTranslation();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [userConversations, setUserConversations] = useState<Record<string, MyConversation[]>>({});
  const [loadingConversations, setLoadingConversations] = useState<Set<string>>(new Set());
  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);

  const profile = useProfile();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!profile) return;
    try {
      setLoading(true);

      // Load profile rows
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        throw profileError;
      }

      // Show all profiles including the current admin's profile
      setProfiles(data || []);
    } catch (error: any) {
      console.error(error.message);
      toast.error(t('admin.profiles.notifications.loadFailed'), {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConversations = async (userId: string) => {
    if (userConversations[userId]) {
      // Already loaded
      return;
    }

    try {
      setLoadingConversations((prev) => new Set(prev).add(userId));

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          start_time,
          end_time,
          ended_reason,
          conversation_type,
          messages,
          personality_id,
          personalities!conversations_personality_id_fkey (
            name
          )
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (error) throw error;

      const conversations: MyConversation[] = data.map((conv) => ({
        id: conv.id,
        start_time: conv.start_time,
        end_time: conv.end_time,
        ended_reason: conv.ended_reason,
        conversation_type: conv.conversation_type,
        messages: Array.isArray(conv.messages) ? conv.messages as unknown as ChatMessage[] : [],
        personality_id: conv.personality_id,
        personality: conv.personalities ? { name: conv.personalities.name } : null,
      }));

      setUserConversations((prev) => ({
        ...prev,
        [userId]: conversations,
      }));
    } catch (error: any) {
      console.error('Error loading conversations:', error.message);
      toast.error('Failed to load conversations', {
        description: error.message,
      });
      // Set empty array to prevent retrying
      setUserConversations((prev) => ({
        ...prev,
        [userId]: [],
      }));
    } finally {
      setLoadingConversations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const toggleUserExpansion = async (userId: string) => {
    const newExpandedUsers = new Set(expandedUsers);

    if (newExpandedUsers.has(userId)) {
      newExpandedUsers.delete(userId);
    } else {
      newExpandedUsers.add(userId);
      // Fetch conversations when expanding
      await fetchUserConversations(userId);
    }

    setExpandedUsers(newExpandedUsers);
  };

  const handleConversationClick = (conversation: MyConversation) => {
    setSelectedConversation(conversation);
    setShowConversationDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredProfiles = useMemo(() => {
    if (!search.trim()) return profiles;
    if (profiles.length === 0) return [];
    return profiles.filter((p) =>
      p.email?.toLowerCase().includes(search.toLowerCase().trim()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase().trim()),
    );
  }, [profiles, search]);

  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: newRole })
        .eq('id', profileId);

      if (error) throw error;

      toast.success(t('admin.profiles.notifications.updateSuccess'));
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, user_role: newRole } : p)),
      );
    } catch (error: any) {
      console.error(error.message);
      toast.error(t('admin.profiles.notifications.updateFailed'), {
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!profile) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <span className="text-muted-foreground">
          {t('admin.profiles.loading')}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.profiles.searchPlaceholder')}
            />
            <Button variant="outline" onClick={fetchData} disabled={loading}>
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
                  <UserProfileRow
                    key={p.id}
                    profile={p}
                    currentUserId={profile?.id}
                    isExpanded={expandedUsers.has(p.id)}
                    isProcessing={isProcessing}
                    conversations={userConversations[p.id] || []}
                    isLoadingConversations={loadingConversations.has(p.id)}
                    onToggleExpansion={toggleUserExpansion}
                    onRoleChange={handleRoleChange}
                    onConversationClick={handleConversationClick}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConversationTranscriptDialog
        isOpen={showConversationDialog}
        onOpenChange={setShowConversationDialog}
        messages={selectedConversation?.messages || []}
        personalityName={selectedConversation?.personality?.name || 'Unknown'}
        mode="admin"
        conversationMetadata={selectedConversation ? {
          conversationType: selectedConversation.conversation_type,
          startTime: selectedConversation.start_time,
          endTime: selectedConversation.end_time,
          endedReason: selectedConversation.ended_reason,
        } : undefined}
        conversationId={selectedConversation?.id}
        onConversationDeleted={() => {
          // Refresh the conversations for the current user when a conversation is deleted
          if (selectedConversation) {
            const userId = Object.keys(userConversations).find((key) =>
              userConversations[key].some((conv) => conv.id === selectedConversation.id),
            );
            if (userId) {
              // Remove conversation from the local state
              setUserConversations((prev) => ({
                ...prev,
                [userId]: prev[userId].filter((conv) => conv.id !== selectedConversation.id),
              }));
            }
          }
          setSelectedConversation(null);
        }}
        allowDelete={true} // Enable delete for admin
      />
    </>
  );
}
