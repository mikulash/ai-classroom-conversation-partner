import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ConversationWithPersonality, UpdateProfileRequest } from '@repo/shared/types/api';
import { useAuth } from '../hooks/useAuth';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ConversationsList } from '../components/ConversationsList';
import { toast } from 'sonner';
import { MyConversation } from '@repo/shared/types/myConversation';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { profileClient } from '@repo/frontend-utils/src/clients/db/profile.client';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

export function UserProfilePage() {
  const { t } = useTypedTranslation();

  const [fullName, setFullName] = useState<string>('');
  const [conversationRole, setConversationRole] = useState('');
  const [gender, setGender] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [conversations, setConversations] = useState<MyConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [isConversationDialogVisible, setIsConversationDialogVisible] = useState(false);

  const { setProfile, profile: cachedProfile, session, ready } = useAuth();

  useEffect(() => {
    if (!cachedProfile) return;
    setFullName(cachedProfile.fullName ?? '');
    setConversationRole(cachedProfile.conversationRole);
    setGender(cachedProfile.gender ?? '');
    setBio(cachedProfile.bio ?? '');
  }, [cachedProfile]);

  const fetchConversations = useCallback(async () => {
    if (!session) {
      console.error('Unable to retrieve session: not authenticated');
      return;
    }

    try {
      setIsLoadingConversations(true);

      const { data, error } = await conversationClient.getCurrent();

      if (error) throw error;

      const toIsoString = (value: Date | string | null | undefined): string => {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toISOString();
      };

      const conversationsData: MyConversation[] = data.map((conv: ConversationWithPersonality) => ({
        id: conv.id,
        start_time: toIsoString(conv.startTime),
        end_time: toIsoString(conv.endTime),
        ended_reason: conv.endedReason ?? '',
        conversation_type: conv.conversationType,
        messages: Array.isArray(conv.messages) ? (conv.messages as unknown as ChatMessage[]) : [],
        personality_id: conv.personalityId ?? null,
        personality: conv.personality ? { name: conv.personality.name } : null,
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
      setIsLoadingConversations(false);
    }
  }, [session]);

  const handleConversationClick = (conversation: MyConversation) => {
    setSelectedConversation(conversation);
    setIsConversationDialogVisible(true);
  };


  const handleSave = async () => {
    if (!cachedProfile) return;
    setIsSaving(true);
    setIsSuccess(false);
    try {
      const payload: UpdateProfileRequest = {
        fullName,
        conversationRole,
        gender,
        bio,
      };

      const { error: updateError, data: freshData } = await profileClient.upsert(
        cachedProfile.id,
        payload,
      );
      if (updateError || freshData === null) {
        console.error('Error saving profile:', updateError);
      } else {
        console.log('Profile saved successfully');
        setProfile(freshData);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Unexpected error saving profile:', error.message);
      } else {
        console.error('Unexpected error saving profile:', error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) {
        return;
      }

      const { data, error: profileError } = await authClient.getCurrentUser();
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return;
      }

      if (data) {
        setFullName(data.fullName ?? '');
        setConversationRole(data.conversationRole ?? '');
        setGender(data.gender ?? '');
        setBio(data.bio ?? '');
        setProfile(data);
      }

      await fetchConversations();
    };

    if (ready) {
      fetchProfile().catch((error: unknown) => {
        if (error instanceof Error) {
          console.error('Error fetching profile:', error.message);
        } else {
          console.error('Error fetching profile:', error);
        }
      });
    }
  }, [fetchConversations, ready, session, setProfile]);

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('userProfile')}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSuccess && (
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
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('saving') : t('saveChanges')}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('profile.myConversations', { defaultValue: 'My conversations' })}</CardTitle>
            <Button
              variant="outline"
              onClick={fetchConversations}
              disabled={isLoadingConversations}
            >
              {t('refresh')}
            </Button>
          </CardHeader>

          <CardContent>
            <ConversationsList
              conversations={conversations}
              isLoading={isLoadingConversations}
              onConversationClick={handleConversationClick}
            />
          </CardContent>
        </Card>
      </div>

      <ConversationTranscriptDialog
        isOpen={isConversationDialogVisible}
        onOpenChange={setIsConversationDialogVisible}
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
        isDeleteAllowed={true} // Enable delete for user's own conversations
      />
    </>
  );
}
