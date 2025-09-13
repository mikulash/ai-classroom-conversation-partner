import React, { useState } from 'react';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { conversationApi } from '@repo/frontend-utils/src/supabaseService';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface ConversationTranscriptDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    messages: ChatMessage[];
    personalityName: string;
    mode?: 'admin' | 'chat'; // Determines the context

    endedDueToTimeLimit?: boolean;
    isSavingConversation?: boolean;
    onGoToPersonalitySelector?: () => void;

    conversationMetadata?: {
        conversationType: string;
        startTime: string;
        endTime: string;
        endedReason: string;
    };

    title?: string;
    description?: string;
    onClose?: () => void;
    conversationId?: number;
    onConversationDeleted?: () => void;
    allowDelete?: boolean;
}

export const ConversationTranscriptDialog: React.FC<ConversationTranscriptDialogProps> = ({
  isOpen,
  onOpenChange,
  messages,
  personalityName,
  mode = 'chat',
  endedDueToTimeLimit = false,
  isSavingConversation = false,
  onGoToPersonalitySelector,
  conversationMetadata,
  title,
  description,
  onClose,
  conversationId,
  onConversationDeleted,
  allowDelete = false,
}) => {
  const { t, language } = useTypedTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Universal format message time function
  const formatMessageTime = (timestamp?: Date | string) => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return new Intl.DateTimeFormat(language.BCP47, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  // Format datetime for admin view
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle conversation deletion
  const handleDeleteConversation = async () => {
    if (!conversationId) return;

    try {
      setIsDeleting(true);
      const { error } = await conversationApi.delete(conversationId);

      if (error) throw error;

      toast.success(t('admin.conversations.deleteSuccess', {
        defaultValue: 'Conversation deleted successfully',
      }));

      // Close confirmation dialog and main dialog
      setShowDeleteConfirmation(false);
      onOpenChange(false);

      // Notify parent component
      if (onConversationDeleted) {
        onConversationDeleted();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting conversation:', error.message);
        toast.error(
          t('admin.conversations.deleteError', {
            defaultValue: 'Failed to delete conversation',
          }),
          {
            description: error.message,
          },
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (mode === 'chat' && onGoToPersonalitySelector) {
      onGoToPersonalitySelector();
    } else {
      onOpenChange(false);
    }
  };

  // Default titles and descriptions based on mode
  const defaultTitle = mode === 'admin' ?
    `Conversation with ${personalityName}` :
    t('chat.conversationTranscript');

  const defaultDescription = mode === 'admin' ?
    undefined :
    t('chat.conversationTranscriptDescription', {
      defaultValue: 'Here is a record of your conversation.',
    });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>

          {mode === 'admin' && conversationMetadata && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>{t('admin.conversations.type', { defaultValue: 'Type' })}: {conversationMetadata.conversationType}</div>
              <div>{t('admin.conversations.started', { defaultValue: 'Started' })}: {formatDateTime(conversationMetadata.startTime)}</div>
              <div>{t('admin.conversations.ended', { defaultValue: 'Ended' })}: {formatDateTime(conversationMetadata.endTime)} ({conversationMetadata.endedReason})</div>
              <div>{t('admin.conversations.messages', { defaultValue: 'Messages' })}: {messages.length}</div>
            </div>
          )}

          {mode === 'chat' && (description || defaultDescription) && (
            <p className="text-sm text-gray-500">
              {description || defaultDescription}
            </p>
          )}
        </DialogHeader>

        {mode === 'chat' && endedDueToTimeLimit && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
            {t('chat.timeLimit', {
              defaultValue: 'Chat ended after reaching the 5-minute time limit.',
            })}
          </div>
        )}

        {mode === 'chat' && isSavingConversation && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg">
            {t('chat.savingConversation', {
              defaultValue: 'Saving conversation...',
            })}
          </div>
        )}

        <ScrollArea className="flex-1 max-h-[60vh] p-4 border rounded-lg">
          {messages && messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'assistant' ? 'pr-4' : 'pl-4'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {msg.role === 'assistant' ? personalityName : t('chat.you', { defaultValue: 'User' })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp && formatMessageTime(msg.timestamp)}
                  </span>
                </div>
                <p className={`p-3 rounded-lg text-sm ${
                  msg.role === 'assistant' ?
                    mode === 'admin' ?
                      'bg-muted text-foreground' :
                      'bg-gray-100 text-gray-800' :
                    mode === 'admin' ?
                      'bg-primary/10 text-foreground' :
                      'bg-blue-100 text-blue-800'
                }`}>
                  {msg.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('admin.profiles.noMessages', { defaultValue: 'No messages found in this conversation' })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <div className="flex justify-between w-full">
            {allowDelete && conversationId && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={isDeleting || isSavingConversation}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('admin.conversations.delete', { defaultValue: 'Delete' })}
              </Button>
            )}

            <div className="ml-auto">
              {mode === 'chat' && onGoToPersonalitySelector ? (
                <Button
                  onClick={onGoToPersonalitySelector}
                  disabled={isSavingConversation || isDeleting}
                >
                  {t('chat.goToPersonalitySelector', { defaultValue: 'Go to Personality Selector' })}
                </Button>
              ) : (
                <Button onClick={handleClose} disabled={isDeleting}>
                  {t('common.close', { defaultValue: 'Close' })}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('admin.conversations.deleteConfirmTitle', {
                defaultValue: 'Delete Conversation',
              })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('admin.conversations.deleteConfirmMessage', {
              defaultValue: 'Are you sure you want to delete this conversation? This action cannot be undone.',
            })}
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={isDeleting}
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConversation}
              disabled={isDeleting}
            >
              {isDeleting ?
                t('admin.conversations.deleting', { defaultValue: 'Deleting...' }) :
                t('admin.conversations.delete', { defaultValue: 'Delete' })
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

