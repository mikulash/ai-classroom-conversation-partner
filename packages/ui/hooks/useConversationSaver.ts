import { useCallback, useRef, useState } from 'react';
import { useTypedTranslation } from './useTypedTranslation';
import { toast } from 'sonner';
import { ConversationLog } from '@repo/shared/types/conversationLog';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import {
  AppConfig,
  Personality,
  Scenario,
} from '@repo/shared/types/db/entities';
import { ConversationType } from '@repo/shared/types/db/enums';
import { CreateConversationRequest, ProfileResponse } from '@repo/shared/types/dbRoutes.types';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';


interface ConversationSaverParams {
    userProfile?: ProfileResponse | null;
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

      const conversationData: CreateConversationRequest = {
        startTime: new Date(chatStartTime),
        endTime: new Date(),
        endedReason: endReason,
        messages: (messagesToSave || []).map((msg) => ({
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
        })),
        personalityId: personality.id,
        scenarioId: scenario?.id || null,
        userId: userProfile.id,
        logs: logsToSave || [],
        createdAt: new Date(),
        conversationType: conversationType,
        usedConfig: appConfig,
      };

      const { error } = await conversationClient.insert(conversationData);

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
