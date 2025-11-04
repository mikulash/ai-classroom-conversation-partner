import { useCallback, useRef, useState } from 'react';
import { useTypedTranslation } from './useTypedTranslation';
import { conversationApi } from '@repo/frontend-utils/src/apiService';
import { toast } from 'sonner';
import { ConversationLog } from '@repo/shared/types/conversationLog';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { AppConfig, Personality, Profile, Scenario } from '@repo/shared/types/db/entities';
import { ConversationType } from '@repo/shared/types/db/enums';
import { ConversationUncheckedCreateInput } from '@repo/shared/generated/prisma/models/Conversation';
import { InputJsonValue } from '@repo/shared/generated/prisma/internal/prismaNamespace';

interface ConversationSaverParams {
    userProfile?: Profile | null;
    personality: Personality;
    scenario?: Scenario | null;
    chatStartTime: number;
    appConfig: AppConfig;
    logMessage: (level: 'log' | 'error' | 'warn', message: string, data?: any) => void;
}

export const useConversationSaver = ({
  userProfile,
  personality,
  scenario,
  chatStartTime,
  appConfig,
  logMessage,
}: ConversationSaverParams) => {
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  const conversationSavedRef = useRef<boolean>(false);
  const { t } = useTypedTranslation();

  const saveConversationToDatabase = useCallback(async (
    endReason: 'timeLimit' | 'silence' | 'manual',
    conversationType:ConversationType,
    messagesToSave?: ChatMessage[],
    logsToSave?: ConversationLog[],
  ) => {
    if (conversationSavedRef.current || !userProfile || !personality) {
      return;
    }

    try {
      setIsSavingConversation(true);
      conversationSavedRef.current = true;

      const conversationData: ConversationUncheckedCreateInput = {
        startTime: new Date(chatStartTime).toISOString(),
        endTime: new Date().toISOString(),
        endedReason: endReason,
        messages: (messagesToSave || []).map((msg) => ({
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
        })) as InputJsonValue,
        personalityId: personality.id,
        scenarioId: scenario?.id || null,
        userId: userProfile.id,
        logs: (logsToSave || []) as unknown as InputJsonValue,
        createdAt: new Date().toISOString(),
        conversationType: conversationType,
        usedConfig: appConfig,
      };

      const { error } = await conversationApi.insert(conversationData);

      if (error) {
        throw new Error(`Failed to save conversation: ${error.message}`);
      }

      logMessage('log', 'Conversation saved successfully');
    } catch (error) {
      logMessage('error', 'Failed to save conversation:', error);
      toast.error(t('chat.errors.saveConversationError', { defaultValue: 'Failed to save conversation' }));
    } finally {
      setIsSavingConversation(false);
    }
  }, [userProfile, personality, scenario, chatStartTime, appConfig, logMessage, t]);

  return {
    isSavingConversation,
    conversationSavedRef,
    saveConversationToDatabase,
  };
};
