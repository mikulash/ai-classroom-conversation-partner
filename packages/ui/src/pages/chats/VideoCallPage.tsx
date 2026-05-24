import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { FaPlay } from 'react-icons/fa';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { AvatarTalkingHead, AvatarTalkingHeadHandle } from '../../components/AvatarTalkingHead';
import { PersonalityInfo } from '../../components/PersonalityInfo';
import { ChatMessages } from '../../components/ChatMessages';
import { Button } from '../../components/ui/button';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { useAuth } from '../../hooks/useAuth';
import { ScenarioInfo } from '../../components/ScenarioInfo';
import { useAppStore } from '../../hooks/useAppStore';
import { ChatPageProps } from '../../lib/types/ChatPageProps';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import type { RealtimeConnection, RealtimeEvent } from '../../lib/types/realtimeConnection';
import { initRealtimeTranscriptionConnection } from '../../lib/initRealtimeTranscriptionConnection';
import { ChatLayout } from '../../layouts/ChatLayout';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import {
  getVoiceChatEmptyStateMessage,
  getVoiceChatStatusLabel,
  getVoiceChatUiStatusMessage,
  processRealtimeTranscriptionEvent,
} from '../../lib/videoCallPageUtils';
import { ChatPageWrapper } from '../../components/ChatPageWrapper';
import { useChatSession } from '../../hooks/useChatSession';
import { useChatTimeLimitMonitor } from '../../hooks/useChatTimeLimitMonitor';
import { useSilenceMonitor } from '../../hooks/useSilenceMonitor';

const VideoCallPageContent: React.FC<ChatPageProps> = ({ personality, conversationRoleName, scenario }) => {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [hasConversationStarted, setHasConversationStarted] = useState(false);
  const [connection, setConnection] = useState<RealtimeConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isBrowserDialogVisible, setIsBrowserDialogVisible] = useState(false);
  const [chatStartTime] = useState<number>(Date.now());

  const appConfig = useAppStore((state) => state.appConfig);
  const { silenceTimeoutInSeconds, maxConversationDurationInSeconds } = appConfig;

  const { t, language } = useTypedTranslation();
  const avatarRef = useRef<AvatarTalkingHeadHandle>(null);
  const { profile: userProfile } = useAuth();

  // ── Composed hooks ─────────────────────────────────────────────────

  const {
    messages, setMessages,
    conversationLogs, setConversationLogs,
    logMessage,
    hasChatEndedRef,
    hasEndedDueToTimeLimit,
    isTranscriptDialogVisible, setIsTranscriptDialogVisible,
    isSavingConversation,
    conversationSavedRef,
    saveConversationToDatabase,
    handleEndChatWithReason,
    handleGoToPersonalitySelector,
  } = useChatSession({ userProfile, personality, scenario, chatStartTime });

  const { markActivity, resetSilenceCounter, lastActivityRef, silenceTriggeredRef } =
    useActivityTracker(logMessage, () => {
      silenceMonitor.resetSilencePrompts();
    });

  // ── Silence handling callbacks ─────────────────────────────────────

  const handleSilencePrompt = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!personality || !userProfile || hasChatEndedRef.current) {
      setIsAiProcessing(false);
      return;
    }

    setIsAiProcessing(true);
    try {
      const silenceSystemPrompt = t('chat.silencePrompt');
      const { text: reply, speech } = await repliesClient.getFullReplyTimestamped({
        inputText: silenceSystemPrompt,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      setMessages((prev) => [...prev, { content: reply, role: 'assistant', timestamp: new Date() }]);
      avatarRef.current?.speakAudio(speech);
    } catch (err) {
      logMessage('error', 'Error during silence prompt', {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsAiProcessing(false);
      markActivity();
    }
  }, [personality, userProfile, hasChatEndedRef, messages, conversationRoleName, language, scenario, t, logMessage, setMessages, markActivity]);

  const handleSilenceLimitReached = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!personality || !userProfile || hasChatEndedRef.current) {
      setIsAiProcessing(false);
      return;
    }
    logMessage('log', 'Maximum consecutive silence prompts reached — ending chat');

    setIsAiProcessing(true);
    try {
      const { text: reply, speech } = await repliesClient.getFullReplyTimestamped({
        inputText: 'The user has been silent for too long. Respond with a short goodbye.',
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      const finalMessage = { content: reply, role: 'assistant', timestamp: new Date() } as ChatMessage;
      const finalMessages = [...messages, finalMessage];
      setMessages(finalMessages);
      avatarRef.current?.speakAudio(speech);

      const silenceSystemPrompt = t('chat.silencePromptGoodbye');
      const goodbyeLog = {
        timestamp: new Date().toISOString(),
        level: 'log' as const,
        message: silenceSystemPrompt,
        data: { reply },
      };
      const finalLogs = [...conversationLogs, goodbyeLog];
      setConversationLogs(finalLogs);

      setTimeout(() => {
        connection?.close();
        setConnection(null);
        void handleEndChatWithReason('silence', 'Video', finalMessages, finalLogs);
      }, 2000);
    } catch (err) {
      logMessage('error', 'Error during final silence prompt', {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsAiProcessing(false);
    }
  }, [personality, userProfile, hasChatEndedRef, messages, conversationRoleName, language, scenario, logMessage, t, conversationLogs, setMessages, setConversationLogs, connection, handleEndChatWithReason]);

  const silenceMonitor = useSilenceMonitor({
    enabled: hasConversationStarted,
    silenceTimeoutMs: silenceTimeoutInSeconds * 1000,
    isAiProcessing,
    hasChatEndedRef,
    lastActivityRef,
    silenceTriggeredRef,
    onSilencePrompt: handleSilencePrompt,
    onSilenceLimitReached: handleSilenceLimitReached,
  });

  // ── Time limit ─────────────────────────────────────────────────────

  useChatTimeLimitMonitor({
    chatStartTime,
    maxDurationMs: maxConversationDurationInSeconds * 1000,
    hasChatEndedRef,
    onTimeLimitReached: useCallback((currentMessages, currentLogs) => {
      logMessage('log', 'Time limit reached — ending chat');
      connection?.close();
      setConnection(null);
      void handleEndChatWithReason('timeLimit', 'Video', currentMessages, currentLogs);
    }, [logMessage, connection, handleEndChatWithReason]),
    setMessages,
    setConversationLogs,
  });

  // ── Transcription event handling ───────────────────────────────────

  const handleTranscriptionCompleted = useCallback((transcript: string) => {
    setCurrentTranscript('');
    markActivity();
    resetSilenceCounter();

    if (transcript.trim().length > 0 && !isAiProcessing) {
      void sendMessage(transcript);
    }
  }, [isAiProcessing]);

  const handleRealtimeEvent = useCallback((ev: RealtimeEvent) => {
    processRealtimeTranscriptionEvent(ev, {
      setIsTranscribing,
      handleTranscriptionCompleted,
      logMessage,
      setError,
      setCurrentTranscript,
      onUserActivity: markActivity,
    });
  }, [handleTranscriptionCompleted, logMessage, markActivity]);

  // ── Send message ───────────────────────────────────────────────────

  const sendMessage = async (messageToSend: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!messageToSend.trim() || !personality) return;

    const userMsg: ChatMessage = { content: messageToSend, role: 'user', timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setCurrentTranscript('');
    setIsAiProcessing(true);
    markActivity();
    resetSilenceCounter();
    if (!userProfile) return;

    try {
      const { text: reply, speech } = await repliesClient.getFullReplyTimestamped({
        inputText: messageToSend,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      setMessages((m) => [
        ...m,
        { content: reply, role: 'assistant', timestamp: new Date() },
      ]);

      avatarRef.current?.speakAudio(speech);
    } catch (err) {
      logMessage('error', 'Error generating full reply', {
        error: err instanceof Error ? err.message : String(err),
      });
      const fallback = t('aiResponseError');
      setMessages((m) => [...m, { content: fallback, role: 'assistant', timestamp: new Date() }]);
    } finally {
      setIsAiProcessing(false);
      markActivity();
    }
  };

  // ── Start / end conversation ───────────────────────────────────────

  const startConversation = async () => {
    logMessage('log', 'startConversation: Starting conversation with personality', {
      personalityName: personality.name,
      conversationRole: conversationRoleName,
    });
    setHasConversationStarted(true);
    setIsConnecting(true);
    setError(null);
    markActivity();

    try {
      const conn = await initRealtimeTranscriptionConnection(handleRealtimeEvent, language);
      setConnection(conn);
    } catch (e) {
      logMessage('error', 'Failed to start conversation', {
        error: e instanceof Error ? e.message : String(e),
      });
      setError((e as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndCall = () => {
    logMessage('log', 'handleEndCall: Ending call and showing transcript');
    connection?.close();
    setConnection(null);
    void handleEndChatWithReason('manual', 'Video');
  };

  // ── Lifecycle ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      connection?.close();
      if (!conversationSavedRef.current && messages.length > 0) {
        void saveConversationToDatabase('manual', 'Video', messages, conversationLogs);
      }
    };
  }, [personality, conversationRoleName]);

  useEffect(() => () => connection?.close(), [connection]);

  // ── Early returns ──────────────────────────────────────────────────

  if (userProfile === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('cannotLoadUserProfile')}
      </div>
    );
  }

  // ── Status helpers ─────────────────────────────────────────────────

  const emptyStateMessage = getVoiceChatEmptyStateMessage({
    hasConversationStarted,
    error,
    isConnecting,
    connection,
    t,
  });

  const [statusText, statusStyle] = getVoiceChatStatusLabel({
    hasConversationStarted,
    error,
    isConnecting,
    connection,
    isTranscribing,
    isAiProcessing,
    t,
  });

  const uiStatusMessage = getVoiceChatUiStatusMessage({
    hasConversationStarted,
    error,
    isConnecting,
    connection,
    t,
  });

  const connectionStatus = (
    <div className="mt-4">
      <p className="text-lg">
        {t('status')}{' '}
        <span className={`font-bold ${statusStyle}`}>{statusText}</span>
      </p>
      {error && (
        <p className="text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <ChatLayout
      isBrowserDialogVisible={isBrowserDialogVisible}
      setIsBrowserDialogVisible={setIsBrowserDialogVisible}
      isTranscriptDialogVisible={isTranscriptDialogVisible}
      setIsTranscriptDialogVisible={setIsTranscriptDialogVisible}
      hasEndedDueToTimeLimit={hasEndedDueToTimeLimit}
      isSavingConversation={isSavingConversation}
      messages={messages}
      personalityName={personality.name}
      onGoToPersonalitySelector={handleGoToPersonalitySelector}
      mode="chat"
    >

      <div className="w-full max-w-4xl mx-auto border-2 rounded-lg p-4 sm:p-8">
        <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('videoCall')}</h1>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 border-2 border-gray-400 rounded-lg p-4 relative"
            style={{ maxHeight: '550px' }}>
            <AvatarTalkingHead ref={avatarRef} language={language} personality={personality}/>
          </div>

          <PersonalityInfo
            personality={personality}
            conversationRole={conversationRoleName}
            connectionStatus={connectionStatus}
            className="flex-1 border-2 border-gray-400 rounded-lg p-4 sm:p-6"
          />
        </div>

        <ScenarioInfo scenario={scenario}/>

        <ChatMessages
          messages={messages}
          currentTranscript={currentTranscript}
          isProcessing={isAiProcessing}
          assistantName={personality.name}
          chatStyle="voice"
          className="h-48 sm:h-64 overflow-y-auto p-3 sm:p-4 border-2 border-gray-400 rounded-lg mb-6 sm:mb-8"
          emptyStateMessage={emptyStateMessage}
          isConnected={isTranscribing}
        />

        <div className="flex justify-center gap-4">
          {!hasConversationStarted ? (
            <Button
              onClick={() => {
                void startConversation();
              }}
              className="px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-xl bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
              disabled={isAiProcessing}
            >
              <span className="mr-2">{t('startConversation')}</span>
              <FaPlay className="inline-block align-middle"/>
            </Button>
          ) : (
            <Button
              onClick={handleEndCall}
              className="px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-xl bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
              disabled={isSavingConversation}
            >
              <span className="mr-2">{t('endCall')}</span>
              <MdCallEnd className="inline-block align-middle"/>
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs sm:text-sm text-center text-gray-500">
          <div className="mt-1">{t('chat.speechRecognitionNote')}</div>
          <div className="mt-1">{uiStatusMessage}</div>
        </div>
      </div>

    </ChatLayout>
  );
};

export const VideoCallPage: React.FC = () => {
  return (
    <ChatPageWrapper>
      {(props) => <VideoCallPageContent {...props} />}
    </ChatPageWrapper>
  );
};
