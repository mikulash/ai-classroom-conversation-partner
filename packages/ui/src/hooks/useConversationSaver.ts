import { useCallback, useRef, useState } from 'react';
import { useTypedTranslation } from './useTypedTranslation';
import { toast } from 'sonner';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { ConversationLogDto, ConversationType, CreateConversationDto } from '@repo/frontend-utils/src/clients/generated';
import { ProfileModel } from '@repo/frontend-utils/src/models';
import { conversationClient } from '@repo/frontend-utils/src/clients/db/conversation.client';
import { PersonalityModel, ScenarioModel } from '@repo/frontend-utils/src/models';


interface ConversationSaverParams {
  userProfile?: ProfileModel | null;
  personality: PersonalityModel;
  scenario?: ScenarioModel | null;
  chatStartTime: number;
  logMessage: (level: 'log' | 'error' | 'warn', message: string, data?: Record<string, unknown>) => void;
}

export const useConversationSaver = ({
  userProfile,
  personality,
  scenario,
  chatStartTime,
  logMessage,
}: ConversationSaverParams) => {
  const [isSavingConversation, setIsSavingConversation] = useState(false);
  const conversationSavedRef = useRef<boolean>(false);
  const { t } = useTypedTranslation();

  const saveConversationToDatabase = useCallback(async (
    endReason: 'timeLimit' | 'silence' | 'manual',
    conversationType: ConversationType,
    messagesToSave?: ChatMessage[],
    logsToSave?: ConversationLogDto[],
  ) => {
    if (conversationSavedRef.current || !userProfile) {
      return;
    }

    try {
      setIsSavingConversation(true);
      conversationSavedRef.current = true;

      const conversationData: CreateConversationDto = {
        startTime: new Date(chatStartTime).toISOString(),
        endTime: new Date().toISOString(),
        endedReason: endReason,
        messages: (messagesToSave ?? []).map((msg) => ({
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp?.toISOString() ?? new Date().toISOString(),
        })),
        personalityId: personality.id !== 0 ? personality.id : null,
        scenarioId: scenario?.id !== 0 ? scenario?.id : null,
        logs: logsToSave ?? [],
        conversationType: conversationType,
      };

      const { error } = await conversationClient.insert(conversationData);

      if (error) {
        throw new Error(`Failed to save conversation: ${error.message}`);
      }

      logMessage('log', 'Conversation saved successfully');
    } catch (error) {
      logMessage('error', 'Failed to save conversation', {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error(t('chat.errors.saveConversationError', { defaultValue: 'Failed to save conversation' }));
    } finally {
      setIsSavingConversation(false);
    }
  }, [userProfile, personality, scenario, chatStartTime, logMessage, t]);

  return {
    isSavingConversation,
    conversationSavedRef,
    saveConversationToDatabase,
  };
};
