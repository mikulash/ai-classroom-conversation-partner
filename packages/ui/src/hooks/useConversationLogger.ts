import { useCallback, useState } from 'react';
import { ConversationLogDto, ConversationLogDtoLevelEnum } from '@repo/frontend-utils/src/clients/generated';

export const useConversationLogger = () => {
  const [conversationLogs, setConversationLogs] = useState<ConversationLogDto[]>([]);

  const isDevelopment = import.meta.env.MODE === 'development';

  const logMessage = useCallback((
    level: ConversationLogDtoLevelEnum,
    message: string,
    data?: Record<string, unknown>,
    includeInRecord = true,
  ) => {
    if (isDevelopment) {
      if (!data) {
        console[level](message);
      } else {
        console[level](message, data);
      }
    }

    if (!includeInRecord) return;
    // Add to conversation logs
    setConversationLogs((prev): ConversationLogDto[] => [...prev, {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }]);
  }, [isDevelopment]);

  return { conversationLogs, setConversationLogs, logMessage };
};
