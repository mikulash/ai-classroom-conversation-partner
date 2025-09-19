import { useCallback, useState } from 'react';
import { ConversationLog, logLevel } from '@repo/shared/types/conversationLog';

export const useConversationLogger = () => {
  const [conversationLogs, setConversationLogs] = useState<ConversationLog[]>([]);

  const isDevelopment = import.meta.env.MODE === 'development';

  const logMessage = useCallback((level: logLevel, message: string, data?: any, includeInRecord = true) => {
    if (isDevelopment) {
      if (!data) {
        console[level](message);
      } else {
        console[level](message, data);
      }
    }

    if (!includeInRecord) return;
    // Add to conversation logs
    setConversationLogs((prev) => [...prev, {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }]);
  }, []);

  return { conversationLogs, setConversationLogs, logMessage };
};
