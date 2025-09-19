import { useLocation, useNavigate } from 'react-router';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useProfile } from '../hooks/useProfile';
import { Loading } from '../components/Loading';
import { Dialog, DialogContent } from '@radix-ui/react-dialog';
import { DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ConversationTranscriptDialog } from '../components/ConversationTranscriptDialog';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import React from 'react';
import { ChatPageProps } from '../lib/types/ChatPageProps';

interface ChatLayoutProps {
    children: React.ReactNode;
    isLoading: boolean;
    isBrowserDialogVisible: boolean;
    setIsBrowserDialogVisible: (show: boolean) => void;
    isTranscriptDialogVisible: boolean;
    setIsTranscriptDialogVisible: (show: boolean) => void;
    hasEndedDueToTimeLimit: boolean;
    isSavingConversation: boolean;
    messages: ChatMessage[];
    onGoToPersonalitySelector: () => void;
    mode: 'chat' | 'admin';
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  children,
  isLoading,
  isBrowserDialogVisible,
  setIsBrowserDialogVisible,
  isTranscriptDialogVisible,
  setIsTranscriptDialogVisible,
  hasEndedDueToTimeLimit,
  isSavingConversation,
  messages,
  onGoToPersonalitySelector,
  mode,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTypedTranslation();
  const userProfile = useProfile();

  const { personality }: ChatPageProps = location.state ?? {};

  if (userProfile === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('cannotLoadUserProfile')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading/>
      </div>
    );
  }

  if (!personality) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('noPersonalitySelected')}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow p-4 sm:p-6">
      <Dialog open={isBrowserDialogVisible} onOpenChange={setIsBrowserDialogVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('speechRecognitionError')}</DialogTitle>
          </DialogHeader>
          <p>{t('chat.errors.browserNotSupported')}</p>
        </DialogContent>
      </Dialog>

      <ConversationTranscriptDialog
        isOpen={isTranscriptDialogVisible}
        onOpenChange={setIsTranscriptDialogVisible}
        endedDueToTimeLimit={hasEndedDueToTimeLimit}
        isSavingConversation={isSavingConversation}
        messages={messages}
        personalityName={personality.name}
        onGoToPersonalitySelector={onGoToPersonalitySelector}
        mode={mode}
        onClose={() => navigate('/chat')}
      />

      {children}
    </div>
  );
};
