import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { Input } from '../../components/ui/input';
import { ChatMessages } from '../../components/ChatMessages';
import { PersonalityInfo } from '../../components/PersonalityInfo';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { MdCallEnd } from 'react-icons/md';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { useAuth } from '../../hooks/useAuth';
import { ScenarioInfo } from '../../components/ScenarioInfo';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { Button } from '../../components/ui/button';
import { getLanguage } from '@repo/frontend-utils/src/enums/Language';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { ChatLayout } from '../../layouts/ChatLayout';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { ChatPageProps } from '../../lib/types/ChatPageProps';
import { ChatPageWrapper } from '../../components/ChatPageWrapper';
import { useChatSession } from '../../hooks/useChatSession';
import { useChatTimeLimitMonitor } from '../../hooks/useChatTimeLimitMonitor';
import { useSilenceMonitor } from '../../hooks/useSilenceMonitor';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';

const MessageChatPageContent: React.FC<ChatPageProps> = ({ personality, conversationRoleName, scenario }) => {
  const { t, i18n } = useTypedTranslation();
  const { profile: userProfile } = useAuth();
  const appConfig = useAppStore((state) => state.appConfig);
  const { silenceTimeoutInSeconds, maxConversationDurationInSeconds } = appConfig;

  const language = getLanguage(i18n.language);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const isInitialMessageSentRef = useRef(false);
  const [chatStartTime] = useState<number>(Date.now());

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

  const audio = useAudioPlayback({
    personality,
    language,
    logMessage,
    markActivity,
    setMessages,
  });

  const conversationType = audio.isAudioEnabled ? 'TextWithAudio' : 'TextOnly';

  const sr = useSpeechRecognition({
    languageBCP47: language.BCP47,
    logMessage,
    markActivity,
    onTranscriptChange: setInputMessage,
  });

  // ── Silence handling callbacks ─────────────────────────────────────

  const handleSilencePrompt = useCallback(async () => {
    if (!userProfile || hasChatEndedRef.current) return;
    logMessage('log', 'Sending silence prompt');

    setIsAiTyping(true);
    try {
      const silenceSystemPrompt = t('chat.silencePrompt');
      const aiText = await repliesClient.getResponse({
        inputText: silenceSystemPrompt,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      if (aiText) {
        await audio.processAiResponse(aiText);
      } else {
        logMessage('error', 'Error during silence prompt', { error: 'Empty response from AI' });
        const fallback = t('chat.silencePromptFallback');
        setMessages((prev) => [...prev, { content: fallback, role: 'assistant', timestamp: new Date() }]);
        markActivity();
      }
    } catch (err) {
      logMessage('error', 'Error during silence prompt', {
        error: err instanceof Error ? err.message : String(err),
      });
      const fallback = t('chat.silencePromptFallback');
      setMessages((prev) => [...prev, { content: fallback, role: 'assistant', timestamp: new Date() }]);
      markActivity();
    } finally {
      setIsAiTyping(false);
    }
  }, [personality, userProfile, hasChatEndedRef, messages, conversationRoleName, language, scenario, logMessage, t, audio, setMessages, markActivity]);

  const handleSilenceLimitReached = useCallback(async () => {
    if (!userProfile || hasChatEndedRef.current) return;
    logMessage('log', 'Maximum consecutive silence prompts reached — ending chat');

    const silenceSystemPrompt = t('chat.silencePromptGoodbye');
    const aiText = await repliesClient.getResponse({
      inputText: silenceSystemPrompt,
      previousMessages: messages,
      personality,
      conversationRole: conversationRoleName,
      language,
      scenario,
      userProfile,
    });

    const finalMessage = { content: aiText, role: 'assistant', timestamp: new Date() } as ChatMessage;
    const finalMessages = [...messages, finalMessage];
    setMessages(finalMessages);

    const goodbyeLog = {
      timestamp: new Date().toISOString(),
      level: 'log' as const,
      message: 'Chat ending due to silence — sending goodbye message',
      data: { aiText },
    };
    const finalLogs = [...conversationLogs, goodbyeLog];
    setConversationLogs(finalLogs);

    setTimeout(() => {
      audio.stopAudio();
      sr.stopRecognition();
      void handleEndChatWithReason('silence', conversationType, finalMessages, finalLogs);
    }, 2000);
  }, [personality, userProfile, hasChatEndedRef, messages, conversationRoleName, language, scenario, logMessage, t, conversationLogs, setMessages, setConversationLogs, audio, sr, handleEndChatWithReason, conversationType]);

  const silenceMonitor = useSilenceMonitor({
    enabled: true,
    silenceTimeoutMs: silenceTimeoutInSeconds * 1000,
    isAiProcessing: isAiTyping || audio.pendingAiMessage !== null,
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
      audio.stopAudio();
      sr.stopRecognition();
      void handleEndChatWithReason('timeLimit', conversationType, currentMessages, currentLogs);
    }, [audio, sr, handleEndChatWithReason, conversationType]),
    setMessages,
    setConversationLogs,
  });

  // ── AI messaging ───────────────────────────────────────────────────

  const handleAiError = (error: unknown, fallbackMessage: string) => {
    logMessage('error', 'Error generating message', {
      error: error instanceof Error ? error.message : String(error),
    });
    return fallbackMessage;
  };

  const sendInitialAIMessage = async () => {
    if (messages.length > 0 || !userProfile) return;
    setIsAiTyping(true);
    try {
      const aiText = await repliesClient.getResponse({
        inputText: 'Just say hi',
        previousMessages: [],
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });
      if (aiText) {
        await audio.processAiResponse(aiText, true, []);
      } else {
        setMessages([{
          content: handleAiError(new Error('Empty response from AI'), t('chat.fallbackGreeting')),
          role: 'assistant',
          timestamp: new Date(),
        }]);
        markActivity();
      }
    } catch (error) {
      setMessages([{
        content: handleAiError(error, t('chat.fallbackGreeting')),
        role: 'assistant',
        timestamp: new Date(),
      }]);
      markActivity();
    } finally {
      setIsAiTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !userProfile) return;
    resetSilenceCounter();

    const userMsg: ChatMessage = { content: inputMessage, role: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsAiTyping(true);
    sr.stopRecognition();
    markActivity();

    try {
      const aiText = await repliesClient.getResponse({
        inputText: userMsg.content,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });
      if (aiText) {
        await audio.processAiResponse(aiText);
      } else {
        setMessages((prev) => [...prev, {
          content: handleAiError(new Error('Empty response from AI'), t('chat.errors.aiResponseError')),
          role: 'assistant',
          timestamp: new Date(),
        }]);
        markActivity();
      }
    } catch (error) {
      setMessages((prev) => [...prev, {
        content: handleAiError(error, t('chat.errors.aiResponseError')),
        role: 'assistant',
        timestamp: new Date(),
      }]);
      markActivity();
    } finally {
      setIsAiTyping(false);
    }
  };

  // ── User actions ───────────────────────────────────────────────────

  const toggleRecording = () => {
    if (!sr.srSupported) {
      toast.error(t('chat.errors.browserNotSupported'));
      return;
    }
    if (sr.isRecording) {
      sr.stopRecognition();
    } else {
      setInputMessage('');
      sr.startRecognition();
    }
    markActivity();
  };

  const handleEndChat = () => {
    audio.stopAudio();
    sr.stopRecognition();
    void handleEndChatWithReason('manual', conversationType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  // ── Lifecycle ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isInitialMessageSentRef.current) {
      isInitialMessageSentRef.current = true;
      setTimeout(() => void sendInitialAIMessage(), 1000);
    }
    return () => {
      audio.stopAudio();
      sr.stopRecognition();
      if (!conversationSavedRef.current && messages.length > 0) {
        void saveConversationToDatabase('manual', conversationType, messages, conversationLogs);
      }
    };
  }, []);

  // ── Early returns ──────────────────────────────────────────────────

  if (userProfile === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('chat.profileError')}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <ChatLayout
      isBrowserDialogVisible={sr.isBrowserDialogVisible}
      setIsBrowserDialogVisible={sr.setIsBrowserDialogVisible}
      isTranscriptDialogVisible={isTranscriptDialogVisible}
      setIsTranscriptDialogVisible={setIsTranscriptDialogVisible}
      hasEndedDueToTimeLimit={hasEndedDueToTimeLimit}
      isSavingConversation={isSavingConversation}
      messages={messages}
      personalityName={personality.name}
      onGoToPersonalitySelector={handleGoToPersonalitySelector}
      mode="chat"
    >

      <div className="w-full max-w-4xl mx-auto border-2 rounded-lg p-4 sm:p-8 flex flex-col flex-grow">
        <div className="border-b-2 pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">
              {t('chat.chatWith', { name: personality.name })}
            </h1>
            <div className="flex items-center gap-2">
              <Label htmlFor="audio-toggle" className="text-sm text-gray-600">
                {audio.isAudioEnabled ? t('chat.audioOn') : t('chat.audioOff')}
              </Label>
              <Switch
                id="audio-toggle"
                checked={audio.isAudioEnabled}
                onCheckedChange={audio.handleAudioToggle}
              />
            </div>
          </div>

          <PersonalityInfo
            personality={personality}
            conversationRole={conversationRoleName}
            className="border-2 border-gray-400 rounded-lg p-6 mb-8"
          />
          <ScenarioInfo scenario={scenario}/>
        </div>

        <ChatMessages
          messages={messages}
          isAiTyping={isAiTyping || (audio.isAudioEnabled && audio.pendingAiMessage !== null)}
          assistantName={personality.name}
          onPlayAudio={(msg, index) => {
            void audio.playMessageAudio(msg, index);
          }}
          isAudioPlaying={audio.isAudioPlaying}
          chatStyle="text"
          className="flex-grow overflow-y-auto mb-4 p-3 border rounded-md"
        />

        <div className="flex items-center">
          <Input
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              markActivity();
            }}
            onKeyDown={handleKeyPress}
            placeholder={t('chat.inputPlaceholder')}
            className="flex-grow mr-2"
            disabled={isAiTyping || sr.isRecording || audio.pendingAiMessage !== null}
          />

          <Button
            onClick={toggleRecording}
            className={`mr-2 p-2 rounded-full ${
              sr.isRecording ?
                'bg-red-600 hover:bg-red-700' :
                'bg-purple-600 hover:bg-purple-700'
            } text-white`}
            disabled={!sr.srSupported || isAiTyping || audio.pendingAiMessage !== null}
          >
            {sr.isRecording ? (
              <>
                <FaStop size={20}/>
                <span className="ml-1 text-xs">{t('chat.stopRecording')}</span>
              </>
            ) : (
              <>
                <FaMicrophone size={20}/>
                <span className="ml-1 text-xs">{t('chat.startRecording')}</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => {
              void sendMessage();
            }}
            className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-full"
            disabled={
              inputMessage.trim() === '' ||
                            isAiTyping ||
                            sr.isRecording ||
                            audio.pendingAiMessage !== null
            }
          >
            <IoMdSend size={20}/>
          </Button>
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleEndChat}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
            disabled={isSavingConversation}
          >
            <span className="mr-2">{t('chat.endChat')}</span>
            <MdCallEnd className="inline-block align-middle"/>
          </Button>
        </div>

        {audio.isAudioEnabled && (
          <div className="mt-2 text-xs text-center text-gray-500">
            {t('chat.aiVoiceNote')}
          </div>
        )}
      </div>
    </ChatLayout>
  );
};

export const MessageChatPage: React.FC = () => {
  return (
    <ChatPageWrapper>
      {(props) => <MessageChatPageContent {...props} />}
    </ChatPageWrapper>
  );
};
