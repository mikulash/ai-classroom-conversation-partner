import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router';
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
 *
 * The redirect is declarative (`<Navigate>`) so there's no flash
 * of empty content and no imperative effect for the redirect itself.
 * A one-shot effect still fires the "please pick a personality first"
 * toast, guarded by a ref so it only shows once per missing-state visit.
 */
export const ChatPageWrapper: React.FC<ChatPageWrapperProps> = ({ children }) => {
  const { t } = useTypedTranslation();
  const setup = useChatSetupStore((state) => state.setup);

  const isReady = setup !== null && setup.conversationRoleName.length > 0;

  const toastedRef = useRef(false);
  useEffect(() => {
    if (isReady || toastedRef.current) return;
    toastedRef.current = true;
    toast.info(t('chat.errors.missingConfiguration', {
      defaultValue: 'Please select a personality and conversation role first',
    }));
  }, [isReady, t]);

  if (!isReady) return <Navigate to="/chat" replace />;

  return <>{children(setup)}</>;
};
