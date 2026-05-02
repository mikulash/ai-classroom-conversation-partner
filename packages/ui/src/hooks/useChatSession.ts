import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { ConversationLogDto, ConversationType } from '@repo/frontend-utils/src/clients/generated';
import { PersonalityModel, ProfileModel, ScenarioModel } from '@repo/frontend-utils/src/models';
import { useConversationLogger } from './useConversationLogger';
import { useConversationSaver } from './useConversationSaver';

interface UseChatSessionParams {
  userProfile: ProfileModel | null | undefined;
  personality: PersonalityModel;
  scenario: ScenarioModel | null;
  chatStartTime: number | null;
}

/**
 * Composite hook that manages the shared chat session lifecycle across all chat pages.
 *
 * Responsibilities:
 * - Message state management
 * - Conversation logging (composes useConversationLogger)
 * - Conversation saving (composes useConversationSaver)
 * - End-chat flow (mark ended, save, show transcript)
 * - Transcript dialog visibility
 * - Navigation back to personality selector
 */
export const useChatSession = ({
  userProfile,
  personality,
  scenario,
  chatStartTime,
}: UseChatSessionParams) => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasChatEndedRef = useRef<boolean>(false);
  const [hasEndedDueToTimeLimit, setHasEndedDueToTimeLimit] = useState(false);
  const [isTranscriptDialogVisible, setIsTranscriptDialogVisible] = useState(false);

  const { conversationLogs, setConversationLogs, logMessage } = useConversationLogger();

  const { isSavingConversation, conversationSavedRef, saveConversationToDatabase } = useConversationSaver({
    userProfile,
    personality,
    scenario,
    chatStartTime: chatStartTime ?? Date.now(),
    logMessage,
  });

  /**
   * Ends the chat session with a given reason.
   *
   * Pages should call their own cleanup (stop audio, disconnect WebRTC, etc.)
   * BEFORE calling this method.
   *
   * @param reason - Why the chat ended
   * @param conversationType - The type of conversation (TextOnly, TextWithAudio, VoiceOnly, Video)
   * @param messagesToSave - Optional snapshot of messages (use when calling from state setters)
   * @param logsToSave - Optional snapshot of logs (use when calling from state setters)
   */
  const handleEndChatWithReason = useCallback(async (
    reason: 'timeLimit' | 'silence' | 'manual' | undefined,
    conversationType: ConversationType,
    messagesToSave?: ChatMessage[],
    logsToSave?: ConversationLogDto[],
  ) => {
    hasChatEndedRef.current = true;

    if (reason === 'timeLimit') {
      setHasEndedDueToTimeLimit(true);
    }

    if (reason) {
      await saveConversationToDatabase(reason, conversationType, messagesToSave, logsToSave);
    }

    setIsTranscriptDialogVisible(true);
  }, [saveConversationToDatabase]);

  const handleGoToPersonalitySelector = useCallback(() => {
    setIsTranscriptDialogVisible(false);
    void navigate('/chat');
  }, [navigate]);

  return {
    // Message state
    messages,
    setMessages,
    // Logging
    conversationLogs,
    setConversationLogs,
    logMessage,
    // Session lifecycle
    hasChatEndedRef,
    hasEndedDueToTimeLimit,
    isSavingConversation,
    conversationSavedRef,
    saveConversationToDatabase,
    // Transcript dialog
    isTranscriptDialogVisible,
    setIsTranscriptDialogVisible,
    // Actions
    handleEndChatWithReason,
    handleGoToPersonalitySelector,
  };
};
