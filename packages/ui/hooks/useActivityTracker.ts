import { useCallback, useRef } from 'react';
import { logLevel } from '@repo/shared/types/conversationLog';

export const useActivityTracker = (logMessage: (level: logLevel, message: string, data?: any) => void) => {
  const lastActivityRef = useRef<number>(Date.now());
  const silenceTriggeredRef = useRef<boolean>(false);

  const markActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    silenceTriggeredRef.current = false;
  }, [logMessage]);

  const resetSilenceCounter = useCallback(() => {
    logMessage('log', 'Resetting silence counter');
  }, [logMessage]);

  return {
    lastActivityRef,
    silenceTriggeredRef,
    markActivity,
    resetSilenceCounter,
  };
};

