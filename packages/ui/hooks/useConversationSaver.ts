import { useCallback, useRef, useState } from 'react';
import { useTypedTranslation } from './useTypedTranslation';
import { conversationApi } from '@repo/api-client/src/supabaseService';
import { toast } from 'sonner';
import { ConversationInsert } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { Log } from '@repo/shared/types/log';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { Enums, Json } from '@repo/shared/types/supabase/database.types';

interface ConversationSaverParams {
    userProfile: any;
    personality: any;
    scenario?: any;
    chatStartTime: number;
    appConfig: any;
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
    conversationType: Enums<'conversation_type'>,
    messagesToSave?: ChatMessage[],
    logsToSave?: Array<Log>,
  ) => {
    if (conversationSavedRef.current || !userProfile || !personality) {
      return;
    }

    try {
      setIsSavingConversation(true);
      conversationSavedRef.current = true;

      const conversationData: ConversationInsert = {
        start_time: new Date(chatStartTime).toISOString(),
        end_time: new Date().toISOString(),
        ended_reason: endReason,
        messages: (messagesToSave || []).map((msg) => ({
          content: msg.content,
          role: msg.role,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
        })) as Json,
        personality_id: personality.id,
        scenario_id: scenario?.id || null,
        user_id: userProfile.id,
        logs: (logsToSave || []) as unknown as Json,
        created_at: new Date().toISOString(),
        conversation_type: conversationType,
        used_config: appConfig,
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
