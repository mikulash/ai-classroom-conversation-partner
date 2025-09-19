import { useCallback, useRef } from 'react';
import { logLevel } from '@repo/shared/types/conversationLog';

export const useActivityTracker = (
  logMessage: (level: logLevel, message: string, data?: any) => void,
  onReset: () => void) => {
  const lastActivityRef = useRef<number>(Date.now());
  const silenceTriggeredRef = useRef<boolean>(false);

  const markActivity = useCallback(() => {
    console.log('mark activity');
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

