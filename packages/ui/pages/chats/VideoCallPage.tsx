import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { FaPlay } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { AvatarTalkingHead, AvatarTalkingHeadHandle } from '../../components/AvatarTalkingHead';
import { PersonalityInfo } from '../../components/PersonalityInfo';
import { ChatMessages } from '../../components/ChatMessages';
import { Button } from '../../components/ui/button';
import { apiClient } from '@repo/frontend-utils/src/clients/figurantClient';
import { useProfile } from '../../hooks/useProfile';
import { ScenarioInfo } from '../../components/ScenarioInfo';
import { useAppStore } from '../../hooks/useAppStore';
import { ChatPageProps } from '../../lib/types/ChatPageProps';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { RealtimeConnection, RealtimeEvent } from '@repo/shared/types/realtimeConnection';
import { initRealtimeTranscriptionConnection } from '../../lib/initRealtimeTranscriptionConnection';
import { ConversationLog } from '@repo/shared/types/conversationLog';
import { useConversationLogger } from '../../hooks/useConversationLogger';
import { ChatLayout } from '../../layouts/ChatLayout';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useConversationSaver } from '../../hooks/useConversationSaver';

const MAX_CONSECUTIVE_SILENCE_PROMPTS = 2;

export const VideoCallPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    personality,
    conversationRoleName,
    scenario,
  }: ChatPageProps = location.state ?? {};
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversationStarted, setConversationStarted] = useState(false);
  const [connection, setConnection] = useState<RealtimeConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showBrowserDialog, setShowBrowserDialog] = useState(false);

  // Transcript dialog and time limit states
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);
  const [chatStartTime] = useState<number>(Date.now());
  const [endedDueToTimeLimit, setEndedDueToTimeLimit] = useState(false);
  const chatEndedRef = useRef<boolean>(false);
  const [consecutiveSilencePrompts, setConsecutiveSilencePrompts] = useState(0);

  const appConfig = useAppStore((state) => state.appConfig);
  const { silence_timeout_in_seconds, max_conversation_duration_in_seconds } = appConfig;

  const { t, language } = useTypedTranslation();

  const avatarRef = useRef<AvatarTalkingHeadHandle>(null);
  const userProfile = useProfile();
  const { conversationLogs, setConversationLogs, logMessage } = useConversationLogger();
  const { markActivity, resetSilenceCounter, lastActivityRef, silenceTriggeredRef } = useActivityTracker(logMessage);

  const { isSavingConversation, conversationSavedRef, saveConversationToDatabase } = useConversationSaver({
    userProfile,
    personality,
    scenario,
    chatStartTime,
    appConfig,
    logMessage,
  });


  const handleTranscriptionCompleted = useCallback((transcript: string, itemId: string) => {
    logMessage('log', 'Transcription completed:', { transcript, itemId });

    setCurrentTranscript('');
    markActivity();
    resetSilenceCounter(); // Reset silence counter on user activity

    if (transcript.trim().length > 0 && !isAiProcessing) {
      void sendMessage(transcript);
    }
  }, [isAiProcessing]);

  const handleRealtimeEvent = useCallback((ev: RealtimeEvent) => {
    logMessage('log', 'Received Realtime event:', ev, false);
    switch (ev.type) {
      case 'error':
        logMessage('error', 'Realtime API error:', ev.error);
        setError(ev.error?.message || 'Unknown error occurred');
        break;

      case 'transcription_session.created':
        logMessage('log', 'Transcription session created', null, false);
        break;

      case 'transcription_session.updated':
        logMessage('log', 'Transcription session updated', null, false);
        break;

      case 'conversation.item.input_audio_transcription.delta':
        // For gpt-4o-transcribe or GPT-4o mini Transcribe, this will be incremental
        setCurrentTranscript((p) => p + ev.delta);
        setIsTranscribing(true);
        markActivity();
        break;

      case 'conversation.item.input_audio_transcription.completed':
        setIsTranscribing(false);
        handleTranscriptionCompleted(ev.transcript, ev.item_id);
        break;

      case 'input_audio_buffer.committed':
        logMessage('log', 'Audio buffer committed:', ev.item_id);
        setIsTranscribing(true);
        break;

      case 'input_audio_buffer.speech_started':
        logMessage('log', 'Speech started');
        setIsTranscribing(true);
        markActivity();
        break;

      case 'input_audio_buffer.speech_stopped':
        logMessage('log', 'Speech stopped');
        markActivity();
        break;

      default:
        logMessage('log', 'Unhandled event:', { type: ev.type, event: ev });
        break;
    }
  }, [handleTranscriptionCompleted]);

  useEffect(() => {
    if (!personality || !conversationRoleName) {
      navigate('/chat'); // Redirect to the personality selector if not set
    }
    setIsLoading(false);

    return () => {
      // Close any active connections
      connection?.close();
      // Save conversation on component unmount if not already saved
      if (!conversationSavedRef.current && messages.length > 0) {
        void saveConversationToDatabase('manual', 'Video', messages, conversationLogs);
      }
    };
  }, [personality, conversationRoleName, navigate]);

  useEffect(() => () => connection?.close(), [connection]);

  useEffect(() => {
    const timeLimit = max_conversation_duration_in_seconds * 1000;
    const interval = setInterval(() => {
      if (chatEndedRef.current) {
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const chatDuration = now - chatStartTime;

      if (chatDuration > timeLimit) {
        logMessage('log', 'Time limit reached - ending chat');
        clearInterval(interval);
        // Get current messages and logs before ending
        setMessages((currentMessages) => {
          setConversationLogs((currentLogs) => {
            void handleEndChatWithReason('timeLimit', currentMessages, currentLogs);
            return currentLogs;
          });
          return currentMessages;
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [chatStartTime]);

  useEffect(() => {
    if (!conversationStarted) return;

    const interval = setInterval(() => {
      logMessage('log', 'silenceDetection: Checking for silence', {
        isAiProcessing,
        chatEnded: chatEndedRef.current,
      });

      if (isAiProcessing) return;
      if (chatEndedRef.current) {
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      if (elapsed > silence_timeout_in_seconds * 1000 && !silenceTriggeredRef.current) {
        silenceTriggeredRef.current = true;
        logMessage('log', 'Silence timeout reached – prompting AI');
        void sendSilencePrompt();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [conversationStarted, isAiProcessing, silence_timeout_in_seconds]);

  const startConversation = async () => {
    logMessage('log', 'startConversation: Starting conversation with personality', {
      personalityName: personality?.name,
      conversationRole: conversationRoleName,
    });
    setConversationStarted(true);
    markActivity();

    try {
      const conn = await initRealtimeTranscriptionConnection(
        handleRealtimeEvent,
        language,
      );
      setConnection(conn);
    } catch (e) {
      logMessage('error', 'Failed to start conversation', e);
      setError((e as Error).message);
    }
  };

  const sendSilencePrompt = async () => {
    logMessage('log', 'sendSilencePrompt: Sending silence prompt due to user inactivity');
    if (!personality || !userProfile || chatEndedRef.current) return;

    // Check if we've reached the maximum number of consecutive silence prompts
    if (consecutiveSilencePrompts >= MAX_CONSECUTIVE_SILENCE_PROMPTS) {
      logMessage('log', 'Maximum consecutive silence prompts reached - ending chat');

      setIsAiProcessing(true);
      try {
        const { text: reply, speech } = await apiClient.getFullReplyTimestamped({
          input_text: 'The user has been silent for too long. Respond with a short goodbye.',
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

        // Add a log entry for the goodbye message
        const goodbyeLog: ConversationLog = {
          timestamp: new Date().toISOString(),
          level: 'log',
          message: silenceSystemPrompt,
          data: { consecutiveSilencePrompts, reply },
        };
        const finalLogs = [...conversationLogs, goodbyeLog];
        setConversationLogs(finalLogs);

        // Wait a moment before ending the chat, then pass the final messages and logs
        setTimeout(() => handleEndChatWithReason('silence', finalMessages, finalLogs), 2000);
      } catch (err) {
        logMessage('error', 'Error during final silence prompt:', err);
      } finally {
        setIsAiProcessing(false);
      }
      return;
    }

    setConsecutiveSilencePrompts((prev) => prev + 1);
    setIsAiProcessing(true);

    try {
      const silenceSystemPrompt = t('chat.silencePrompt');

      const { text: reply, speech } = await apiClient.getFullReplyTimestamped({
        input_text: silenceSystemPrompt,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      logMessage('log', 'sendSilencePrompt: Received AI response', { replyLength: reply.length });
      setMessages((prev) => [...prev, { content: reply, role: 'assistant', timestamp: new Date() }]);
      avatarRef.current?.speakAudio(speech);
    } catch (err) {
      logMessage('error', 'Error during silence prompt:', err);
    } finally {
      setIsAiProcessing(false);
      markActivity();
    }
  };

  const sendMessage = async (messageToSend: string) => {
    logMessage('log', 'sendMessage: Sending user message', { messageLength: messageToSend.length });
    if (!messageToSend.trim() || !personality) return;

    // Don't stop the WebRTC connection, just mark that we're processing
    const userMsg: ChatMessage = { content: messageToSend, role: 'user', timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setCurrentTranscript('');
    setIsAiProcessing(true);
    markActivity();
    resetSilenceCounter(); // Reset silence counter when the user sends a message
    if (!userProfile) return;

    try {
      const { text: reply, speech } = await apiClient.getFullReplyTimestamped({
        input_text: messageToSend,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      logMessage('log', 'sendMessage: Received AI response', { replyLength: reply.length });
      setMessages((m) => [
        ...m,
        { content: reply, role: 'assistant', timestamp: new Date() },
      ]);

      avatarRef.current?.speakAudio(speech);
    } catch (err) {
      logMessage('error', 'Error generating full reply:', err);
      const fallback = t('aiResponseError');
      setMessages((m) => [...m, { content: fallback, role: 'assistant', timestamp: new Date() }]);
    } finally {
      setIsAiProcessing(false);
      markActivity();
    }
  };

  // Handler for ending chat with a specific reason
  const handleEndChatWithReason = async (reason?: 'timeLimit' | 'silence' | 'manual', messagesToSave?: ChatMessage[], logsToSave?: ConversationLog[]) => {
    logMessage('log', 'Ending chat with reason:', reason);

    connection?.close();
    setConnection(null);

    const finalMessages = messagesToSave || messages;
    const finalLogs = logsToSave || conversationLogs;

    chatEndedRef.current = true;

    if (reason === 'timeLimit') {
      setEndedDueToTimeLimit(true);
    }

    // Save conversation to a database
    if (reason) {
      await saveConversationToDatabase(reason, 'Video', finalMessages, finalLogs);
    }

    setShowTranscriptDialog(true);
  };

  // Handler for going to personality selector after viewing transcript
  const handleGoToPersonalitySelector = () => {
    setShowTranscriptDialog(false);
    navigate('/chat');
  };

  const handleEndCall = () => {
    logMessage('log', 'handleEndCall: Ending call and showing transcript');
    void handleEndChatWithReason('manual');
  };

  if (userProfile === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('cannotLoadUserProfile')}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('loading.general')}
      </div>
    );
  }

  if (!personality) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('noPersonalitySelected')}
      </div>
    );
  }

  const emptyStateMessage = (() => {
    if (!conversationStarted) {
      return t('clickStartConversation');
    } else if (connection && !error) {
      return t('startSpeaking');
    } else {
      return t('voiceDetectionError');
    }
  })();

  const [statusText, statusStyle] = (() => {
    if (!conversationStarted) {
      return [t('readyToStart'), 'text-gray-600'] as [string, string];
    } else if (error) {
      return [t('voiceDetectionErrorStatus'), 'text-red-600'];
    } else if (isTranscribing) {
      return [t('listeningToYou'), 'text-green-600'];
    } else if (isAiProcessing) {
      return [t('aiProcessing'), 'text-purple-600'];
    } else {
      return [t('readyWaitingForSpeech'), 'text-blue-600'];
    }
  })();

  const uiStatusMessage = (() => {
    if (!conversationStarted) {
      return t('clickStartConversationFullMessage');
    } else if (error) {
      return t('voiceDetectionFailedMessage');
    } else {
      return t('voiceDetectionActiveMessage');
    }
  })();

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

  return (
    <ChatLayout
      isLoading={isLoading}
      showBrowserDialog={showBrowserDialog}
      setShowBrowserDialog={setShowBrowserDialog}
      showTranscriptDialog={showTranscriptDialog}
      setShowTranscriptDialog={setShowTranscriptDialog}
      endedDueToTimeLimit={endedDueToTimeLimit}
      isSavingConversation={isSavingConversation}
      messages={messages}
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
          {!conversationStarted ? (
            <Button
              onClick={startConversation}
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
          <div>
            {t('aiGeneratedNote')}
          </div>
          <div className="mt-1">{uiStatusMessage}</div>
        </div>
      </div>

    </ChatLayout>
  );
};

