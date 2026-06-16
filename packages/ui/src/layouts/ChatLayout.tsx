import React from 'react';
import { useNavigate } from 'react-router';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';

interface ChatLayoutProps {
    children: React.ReactNode;
    isBrowserDialogVisible: boolean;
    setIsBrowserDialogVisible: (show: boolean) => void;
    isTranscriptDialogVisible: boolean;
    setIsTranscriptDialogVisible: (show: boolean) => void;
    hasEndedDueToTimeLimit: boolean;
    isSavingConversation: boolean;
    messages: ChatMessage[];
    personalityName: string;
    onGoToPersonalitySelector: () => void;
    mode: 'chat' | 'admin';
}

/**
 * Layout shell for all chat pages.
 */
export const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  isBrowserDialogVisible,
  setIsBrowserDialogVisible,
  isTranscriptDialogVisible,
  setIsTranscriptDialogVisible,
  hasEndedDueToTimeLimit,
  isSavingConversation,
  messages,
  personalityName,
  onGoToPersonalitySelector,
  mode,
}) => {
  const navigate = useNavigate();
  const { t } = useTypedTranslation();

  return (
    <div className="flex flex-col flex-grow p-4 sm:p-6">
      <Dialog open={isBrowserDialogVisible} onOpenChange={setIsBrowserDialogVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('call.speechRecognitionError')}</DialogTitle>
          </DialogHeader>
          <p>{t('chat.errors.browserNotSupported')}</p>
        </DialogContent>
      </Dialog>

      <ConversationTranscriptDialog
        isOpen={isTranscriptDialogVisible}
        onOpenChange={setIsTranscriptDialogVisible}
        hasEndedDueToTimeLimit={hasEndedDueToTimeLimit}
        isSavingConversation={isSavingConversation}
        messages={messages}
        personalityName={personalityName}
        onGoToPersonalitySelector={onGoToPersonalitySelector}
        mode={mode}
        onClose={() => {
          void navigate('/chat');
        }}
      />

      {children}
    </div>
  );
};
