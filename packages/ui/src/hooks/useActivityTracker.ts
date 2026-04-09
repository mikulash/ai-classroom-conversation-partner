import { useCallback, useRef } from 'react';
import { ConversationLogDtoLevelEnum } from '@repo/frontend-utils/src/clients/generated';

export const useActivityTracker = (
  logMessage: (level: ConversationLogDtoLevelEnum, message: string, data?: Record<string, unknown>) => void,
  onReset: () => void) => {
  const lastActivityRef = useRef<number>(Date.now());
  const silenceTriggeredRef = useRef<boolean>(false);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    silenceTriggeredRef.current = false;
  }, [logMessage]);

  const resetSilenceCounter = useCallback(() => {
    logMessage('log', 'Resetting silence counter');
    lastActivityRef.current = Date.now();
    silenceTriggeredRef.current = false;
    onReset();
  }, [logMessage, onReset]);

  return {
    lastActivityRef,
    silenceTriggeredRef,
    markActivity,
    resetSilenceCounter,
  };
};

