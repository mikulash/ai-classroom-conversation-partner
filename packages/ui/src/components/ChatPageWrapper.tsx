import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChatPageProps } from '../lib/types/ChatPageProps';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useChatSetupStore } from '../hooks/useChatSetupStore';

interface ChatPageWrapperProps {
  children: (props: ChatPageProps) => React.ReactNode;
}

/**
 * Reads the chat setup (personality / role / scenario) from
 * `useChatSetupStore` (sessionStorage-persisted) and feeds it
 * down to the wrapped chat page. Redirects to the selector if
 * the setup is missing.
 */
export const ChatPageWrapper: React.FC<ChatPageWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTypedTranslation();
  const setup = useChatSetupStore((state) => state.setup);

  const isReady = setup !== null && setup.conversationRoleName.length > 0;

  useEffect(() => {
    if (!isReady) {
      toast.info(t('chat.errors.missingConfiguration', {
        defaultValue: 'Please select a personality and conversation role first',
      }));
      void navigate('/chat', { replace: true });
    }
  }, [isReady, navigate, t]);

  if (!isReady) return null;

  return <>{children(setup)}</>;
};
