import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ConversationsList } from '../components/ConversationsList';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import {
  useCurrentUserConversations,
  useCurrentUserProfile,
  useUpdateProfile,
} from '../hooks/queries/useCurrentUser';

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
  const { profile: cachedProfile } = useAuth();

  // Drives the auth-store profile from server truth on mount / refetch.
  useCurrentUserProfile();

  const updateProfile = useUpdateProfile();
  const conversationsQuery = useCurrentUserConversations();

  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [isConversationDialogVisible, setIsConversationDialogVisible] = useState(false);

  useEffect(() => {
    if (conversationsQuery.error) {
      toast.error('Failed to load conversations', {
        description: conversationsQuery.error.message,
      });
    }
  }, [conversationsQuery.error]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: cachedProfile ? {
      fullName: cachedProfile.fullName,
      conversationRole: cachedProfile.conversationRole,
      gender: cachedProfile.gender,
      bio: cachedProfile.bio,
    } : EMPTY_VALUES,
  });

  // Re-hydrate form when a new profile object arrives, without overwriting
  // in-flight user edits between fetches.
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

  const handleConversationClick = (conversation: MyConversation) => {
    setSelectedConversation(conversation);
    setIsConversationDialogVisible(true);
  };

  const onSubmit = async (values: ProfileValues) => {
    if (!cachedProfile) return;
    setIsSuccess(false);
    try {
      await updateProfile.mutateAsync({ profileId: cachedProfile.id, payload: values });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error saving profile:', message);
    }
  };

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
                  <div className="p-4 mb-4 text-green-800 bg-green-100 dark:text-green-300 dark:bg-green-950 rounded" role="status">
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
                void conversationsQuery.refetch();
              }}
              disabled={conversationsQuery.isFetching}
            >
              {t('refresh')}
            </Button>
          </CardHeader>

          <CardContent>
            <ConversationsList
              conversations={conversationsQuery.data ?? []}
              isLoading={conversationsQuery.isLoading}
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
          setSelectedConversation(null);
        }}
        isDeleteAllowed={true} // Enable delete for user's own conversations
      />
    </>
  );
}
