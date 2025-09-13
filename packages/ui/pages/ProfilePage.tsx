import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  authApi,
  conversationApi,
  profileApi,
  ConversationWithPersonality,
} from '@repo/frontend-utils/src/supabaseService';
import { ProfileInsert } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { useUserStore } from '../hooks/useUserStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ConversationsList } from '../components/ConversationsList';
import { toast } from 'sonner';
import { MyConversation } from '@repo/shared/types/myConversation';

export function UserProfilePage() {
  const { t } = useTypedTranslation();

  const [fullName, setFullName] = useState<string>('');
  const [conversationRole, setConversationRole] = useState('');
  const [gender, setGender] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [conversations, setConversations] = useState<MyConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [showConversationDialog, setShowConversationDialog] = useState(false);

  const { setProfile, profile: cachedProfile } = useUserStore();

  useEffect(() => {
    if (!cachedProfile) return;
    setFullName(cachedProfile.full_name ?? '');
    setConversationRole(cachedProfile.conversation_role);
    setGender(cachedProfile.gender ?? '');
    setBio(cachedProfile.bio ?? '');
  }, [cachedProfile]);

  const fetchConversations = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await authApi.getSession();

    if (sessionError || !session) {
      console.error('Unable to retrieve session:', sessionError);
      return;
    }

    try {
      setLoadingConversations(true);

      const { data, error } = await conversationApi.byUser(session.user.id);

      if (error) throw error;

      const conversationsData: MyConversation[] = data.map((conv: ConversationWithPersonality) => ({
        id: conv.id,
        start_time: conv.start_time,
        end_time: conv.end_time,
        ended_reason: conv.ended_reason,
        conversation_type: conv.conversation_type,
        messages: Array.isArray(conv.messages) ? conv.messages as unknown as ChatMessage[] : [],
        personality_id: conv.personality_id,
        personality: conv.personalities ? { name: conv.personalities.name } : null,
      }));

      setConversations(conversationsData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error loading conversations:', error.message);
        toast.error('Failed to load conversations', {
          description: error.message,
        });
      }
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleConversationClick = (conversation: MyConversation) => {
    setSelectedConversation(conversation);
    setShowConversationDialog(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await authApi.getSession();
      if (sessionError || !session) {
        console.error('Unable to retrieve session:', sessionError);
        return;
      }

      const payload: ProfileInsert = {
        id: session.user.id,
        full_name: fullName,
        conversation_role: conversationRole,
        gender,
        bio,
      };

      const { error: updateError, data: freshData } = await profileApi.upsert(
        payload,
      );
      if (updateError || freshData[0] === null) {
        console.error('Error saving profile:', updateError);
      } else {
        console.log('Profile saved successfully');
        setProfile(freshData[0]);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Unexpected error saving profile:', error.message);
      } else {
        console.error('Unexpected error saving profile:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error: fetchError,
      } = await authApi.getSession();
      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        return;
      }
      if (session) {
        const userId = session.user.id;
        const { data, error: profileError } = await profileApi.getById(
          userId,
          'full_name, conversation_role, gender, bio',
        );
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }
        if (data) {
          setFullName(data.full_name ?? '');
          setConversationRole(data.conversation_role ?? '');
          setGender(data.gender ?? '');
          setBio(data.bio ?? '');
        }

        await fetchConversations();
      }
    };

    fetchProfile().catch((error: unknown) => {
      if (error instanceof Error) {
        console.error('Error fetching profile:', error.message);
      } else {
        console.error('Error fetching profile:', error);
      }
    });
  }, []);

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('userProfile')}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {success && (
              <div className="p-4 mb-4 text-green-800 bg-green-100 rounded">
                {t('profileSavedSuccess')}
              </div>
            )}

            <div>
              <Label htmlFor="fullName">{t('username')}</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('usernamePlaceholder')}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground">
                {t('usernameHelp')}
              </p>
            </div>

            <div>
              <Label htmlFor="gender">{t('gender')}</Label>
              <Input
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder={t('genderPlaceholder')}
                className={'mt-1'}
              />
              <p className="text-sm text-muted-foreground">
                {t('genderHelp')}
              </p>
            </div>

            <div>
              <Label htmlFor="bio">{t('bio')}</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t('bioPlaceholder')}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground">
                {t('bioHelp')}
              </p>
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('saving') : t('saveChanges')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('profile.myConversations', { defaultValue: 'My conversations' })}</CardTitle>
            <Button
              variant="outline"
              onClick={fetchConversations}
              disabled={loadingConversations}
            >
              {t('refresh')}
            </Button>
          </CardHeader>

          <CardContent>
            <ConversationsList
              conversations={conversations}
              isLoading={loadingConversations}
              onConversationClick={handleConversationClick}
              formatDateTime={formatDateTime}
            />
          </CardContent>
        </Card>
      </div>

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
          setConversations((prev) => prev.filter((conv) => conv.id !== selectedConversation?.id));
          setSelectedConversation(null);
        }}
        allowDelete={true} // Enable delete for user's own conversations
      />
    </>
  );
}
