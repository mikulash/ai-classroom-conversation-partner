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
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ConversationsList } from '../components/ConversationsList';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';
import {
  useCurrentUserProfile,
  useMyConversations,
  useRemoveMyConversationFromCache,
  useUpdateMyProfile,
} from '../hooks/queries/useCurrentUser';

const profileSchema = z.object({
  fullName: z.string().default(''),
  conversationRole: z.string().default(''),
  gender: z.string().default(''),
  bio: z.string().default(''),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EMPTY: ProfileFormValues = { fullName: '', conversationRole: '', gender: '', bio: '' };

export function UserProfilePage() {
  const { t } = useTypedTranslation();

  const profileQuery = useCurrentUserProfile();
  const conversationsQuery = useMyConversations();
  const updateProfile = useUpdateMyProfile();
  const removeConversationFromCache = useRemoveMyConversationFromCache();

  const [selectedConversation, setSelectedConversation] = useState<MyConversation | null>(null);
  const [isConversationDialogVisible, setIsConversationDialogVisible] = useState(false);
  const [showSavedFlash, setShowSavedFlash] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY,
  });

  // Sync server truth into the form when it arrives or changes. RHF's
  // `form.reset` is the canonical way to swap defaults without stomping
  // a user mid-edit (it only reapplies dirty/touched flags as needed).
  useEffect(() => {
    if (!profileQuery.data) return;
    form.reset({
      fullName: profileQuery.data.fullName,
      conversationRole: profileQuery.data.conversationRole,
      gender: profileQuery.data.gender,
      bio: profileQuery.data.bio,
    });
  }, [profileQuery.data]);

  // Auto-clear the green "saved" banner after 3s without an effect-driven
  // timeout from inside the submit handler.
  useEffect(() => {
    if (!showSavedFlash) return;
    const handle = setTimeout(() => {
      setShowSavedFlash(false);
    }, 3000);
    return () => {
      clearTimeout(handle);
    };
  }, [showSavedFlash]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!profileQuery.data) return;
    try {
      await updateProfile.mutateAsync({
        profileId: profileQuery.data.id,
        input: values,
      });
      setShowSavedFlash(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Error saving profile:', message);
      toast.error(message);
    }
  };

  const handleConversationClick = (conversation: MyConversation) => {
    setSelectedConversation(conversation);
    setIsConversationDialogVisible(true);
  };

  const handleConversationDeleted = () => {
    if (selectedConversation) {
      removeConversationFromCache(selectedConversation.id);
    }
    setSelectedConversation(null);
  };

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
                {showSavedFlash && (
                  <div className="p-4 mb-4 text-green-800 bg-green-100 rounded" role="status">
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
                        <Input placeholder={t('usernamePlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('usernameHelp')}</FormDescription>
                      <FormMessage />
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
                        <Input placeholder={t('genderPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('genderHelp')}</FormDescription>
                      <FormMessage />
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
                        <Textarea placeholder={t('bioPlaceholder')} {...field} />
                      </FormControl>
                      <FormDescription>{t('bioHelp')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="justify-end">
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? t('saving') : t('saveChanges')}
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
              {t('common.refresh')}
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
        onConversationDeleted={handleConversationDeleted}
        isDeleteAllowed={true}
      />
    </>
  );
}
