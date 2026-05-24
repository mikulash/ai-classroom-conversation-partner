import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { useAuth } from '../hooks/useAuth';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ConversationsList } from '../components/ConversationsList';
import { toast } from 'sonner';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { profileClient } from '@repo/frontend-utils/src/clients/db/profile.client';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';
import { ConversationModel } from '@repo/frontend-utils/src/models';

const profileSchema = z.object({
  fullName: z.string().trim().min(1),
  conversationRole: z.string(),
  gender: z.string(),
  bio: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;

const EMPTY_VALUES: ProfileValues = {
  fullName: '',
  conversationRole: '',
  gender: '',
  bio: '',
};

export function UserProfilePage() {
  const { t } = useTypedTranslation();
  const { setProfile, profile: cachedProfile, session, ready } = useAuth();

  const [isSuccess, setIsSuccess] = useState(false);
  const [conversations, setConversations] = useState<MyConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [isConversationDialogVisible, setIsConversationDialogVisible] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: cachedProfile ? {
      fullName: cachedProfile.fullName,
      conversationRole: cachedProfile.conversationRole,
      gender: cachedProfile.gender,
      bio: cachedProfile.bio,
    } : EMPTY_VALUES,
  });

  // Re-hydrate form when a new profile object arrives (initial load or fresh fetch),
  // without overwriting in-flight user edits between fetches.
  const [hydratedProfileId, setHydratedProfileId] = useState<string | null>(
    cachedProfile?.id ?? null,
  );
  if (cachedProfile && cachedProfile.id !== hydratedProfileId) {
    setHydratedProfileId(cachedProfile.id);
    form.reset({
      fullName: cachedProfile.fullName,
      conversationRole: cachedProfile.conversationRole,
      gender: cachedProfile.gender,
      bio: cachedProfile.bio,
    });
  }

  const fetchConversations = useCallback(async () => {
    if (!session) {
      console.error('Unable to retrieve session: not authenticated');
      return;
    }

    try {
      setIsLoadingConversations(true);

      const { data, error } = await conversationClient.getCurrentUserConversations();

      if (error) {
        console.error('Error loading conversations:', error.message);
        toast.error('Failed to load conversations', {
          description: error.message,
        });
        return;
      }

      const toIsoString = (value: Date | string | null | undefined): string => {
        if (!value) return '';
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toISOString();
      };

      const conversationsData: MyConversation[] = data.map((conv: ConversationModel) => ({
        id: conv.id,
        start_time: toIsoString(conv.startTime),
        end_time: toIsoString(conv.endTime),
        ended_reason: conv.endedReason,
        conversation_type: conv.conversationType,
        messages: Array.isArray(conv.messages) ? (conv.messages as unknown as ChatMessage[]) : [],
        personality_id: conv.personalityId,
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

  const onSubmit = async (values: ProfileValues) => {
    if (!cachedProfile) return;
    setIsSuccess(false);
    try {
      const { error: updateError, data: freshData } = await profileClient.upsert(
        cachedProfile.id,
        values,
      );
      if (updateError) {
        console.error('Error saving profile:', updateError);
      } else {
        setProfile(freshData);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Unexpected error saving profile:', error.message);
      } else {
        console.error('Unexpected error saving profile:', error);
      }
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
      setProfile(data);

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

  const { isSubmitting } = form.formState;

  return (
    <>
      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('userProfile')}</CardTitle>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}>
              <CardContent className="space-y-6">
                {isSuccess && (
                  <div className="p-4 mb-4 text-green-800 bg-green-100 rounded">
                    {t('profileSavedSuccess')}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('usernamePlaceholder')} className="mt-1" {...field} />
                      </FormControl>
                      <FormDescription>{t('usernameHelp')}</FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('gender')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('genderPlaceholder')} className="mt-1" {...field} />
                      </FormControl>
                      <FormDescription>{t('genderHelp')}</FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('bio')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('bioPlaceholder')} className="mt-1" {...field} />
                      </FormControl>
                      <FormDescription>{t('bioHelp')}</FormDescription>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('saving') : t('saveChanges')}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('profile.myConversations', { defaultValue: 'My conversations' })}</CardTitle>
            <Button
              variant="outline"
              onClick={() => {
                void fetchConversations();
              }}
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
        onConversationDeleted={() => {
          setConversations((prev) => prev.filter((conv) => conv.id !== selectedConversation?.id));
          setSelectedConversation(null);
        }}
        isDeleteAllowed={true} // Enable delete for user's own conversations
      />
    </>
  );
}
