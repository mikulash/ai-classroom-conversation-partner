import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChatPageProps } from '../lib/types/ChatPageProps';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

interface ChatPageWrapperProps {
  children: (props: ChatPageProps) => React.ReactNode;
}

/**
 * Wrapper component that validates location state for chat pages.
 * Redirects to personality selector if required props are missing.
 */
export const ChatPageWrapper: React.FC<ChatPageWrapperProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTypedTranslation();

  const state = location.state as ChatPageProps | undefined;

  useEffect(() => {
    // Check if all required props are present
    if (!state?.personality || !state.conversationRoleName) {
      toast.info(t('chat.errors.missingConfiguration', {
        defaultValue: 'Please select a personality and conversation role first',
      }));
      void navigate('/chats/personality-selector', { replace: true });
    }
  }, [state, navigate, t]);

  // Don't render children until we've validated the state
  if (!state?.personality || !state.conversationRoleName) {
    return null;
  }

  const chatPageProps: ChatPageProps = {
    personality: state.personality,
    conversationRoleName: state.conversationRoleName,
    scenario: state.scenario ?? null,
  };

  return <>{children(chatPageProps)}</>;
};
