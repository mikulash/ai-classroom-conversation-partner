import { ChatMessage } from '@repo/shared/types/chatMessage';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Input } from '../../components/ui/input';
import { ChatMessages } from '../../components/ChatMessages';
import { PersonalityInfo } from '../../components/PersonalityInfo';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { MdCallEnd } from 'react-icons/md';
import { TextToSpeechRequest } from '@repo/shared/types/apiFigurantClient';
import { apiClient } from '@repo/frontend-utils/src/clients/figurantClient';
import { Personality } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { useProfile } from '../../hooks/useProfile';
import { ScenarioInfo } from '../../components/ScenarioInfo';
import { toast } from 'sonner';
import { useAppStore } from '../../hooks/useAppStore';
import { Button } from '../../components/ui/button';
import { getLanguage } from '@repo/shared/enums/Language';
import { Loading } from '../../components/Loading';
import { ChatPageProps } from '@repo/shared/types/ChatPageProps';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { Log } from '@repo/shared/types/log';
import { useConversationLogger } from '../../hooks/useConversationLogger';
import { ChatLayout } from '../../layouts/ChatLayout';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { useConversationSaver } from '../../hooks/useConversationSaver';

const MAX_CONSECUTIVE_SILENCE_PROMPTS = 2;

const SpeechRecognitionClass: typeof SpeechRecognition | undefined =
    window.SpeechRecognition || window.webkitSpeechRecognition;

export const MessageChatPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTypedTranslation();

  const {
    personality,
    conversationRoleName,
    scenario,
  }: ChatPageProps = location.state ?? {};
  const appConfig = useAppStore((state) => state.appConfig);
  const { silence_timeout_in_seconds, max_conversation_duration_in_seconds } = appConfig;
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingAiMessage, setPendingAiMessage] = useState<ChatMessage | null>(null);
  const [consecutiveSilencePrompts, setConsecutiveSilencePrompts] = useState(0);
  const [showTranscriptDialog, setShowTranscriptDialog] = useState(false);

  const userProfile = useProfile();

  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const initialMessageSentRef = useRef<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const language = getLanguage(i18n.language);
  const [showBrowserDialog, setShowBrowserDialog] = useState(false);
  const [chatStartTime] = useState<number>(Date.now());
  const chatEndedRef = useRef<boolean>(false);

  const conversationType = audioEnabled ? 'TextWithAudio' : 'TextOnly';

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


  const [endedDueToTimeLimit, setEndedDueToTimeLimit] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [srSupported, setSrSupported] = useState(Boolean(SpeechRecognitionClass));

  // Init SpeechRecognition
  useEffect(() => {
    if (!srSupported) return;

    const recognition = new SpeechRecognitionClass!();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language.BCP47;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      markActivity();
      setInputMessage(transcript);
    };

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      logMessage('error', 'Speech recognition error', ev.error);
      toast.error('Speech recognition failed; returning to chat list…');
      if (ev.error === 'network') {
        setShowBrowserDialog(true);
        setSrSupported(false);
        setIsRecording(false);
      }
      stopRecognition();
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [language.BCP47, srSupported]);

  const startRecognition = () => {
    if (!recognitionRef.current || isRecording) return;
    try {
      recognitionRef.current.lang = language.BCP47;
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      logMessage('error', 'Failed to start recognition', err);
    }
  };

  const stopRecognition = () => {
    if (!recognitionRef.current || !isRecording) return;
    recognitionRef.current.stop();
    setIsRecording(false);
  };

  const handleAiError = (error: unknown, fallbackMessage: string) => {
    logMessage('error', 'Error generating message:', error);
    return fallbackMessage;
  };

  // Audio event handlers
  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    audioRef.current = null;
  };

  const handleAudioError = (error: any) => {
    logMessage('warn', 'Audio playback error (non-critical):', error);
    setIsAudioPlaying(false);
    audioRef.current = null;
  };

  const stopAudio = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      } catch (error) {
        logMessage('warn', 'Error stopping audio:', error);
      }
      audioRef.current = null;
      setIsAudioPlaying(false);
    }
  };

  const generateAudio = async (text: string): Promise<string | null> => {
    try {
      const ttsParams: TextToSpeechRequest = {
        inputMessage: text,
        personality,
        language,
        response_format: 'mp3',
      };
      const audio = await apiClient.getSpeechAudio(ttsParams);
      return audio.objectUrl;
    } catch (error) {
      logMessage('error', 'Error generating audio:', error);
      return null;
    }
  };

  const playAudio = async (audioUrl: string): Promise<void> => {
    try {
      // Stop any existing audio before starting new one
      stopAudio();

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);

      setIsAudioPlaying(true);
      await audio.play();
    } catch (error) {
      // Handle play() promise rejection gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        logMessage('log', 'Audio playback was interrupted (normal behavior)');
      } else {
        logMessage('warn', 'Audio playback failed:', error);
      }
      setIsAudioPlaying(false);
      audioRef.current = null;
    }
  };

  const playMessageAudio = async (message: ChatMessage, index: number) => {
    if (isAudioPlaying) {
      stopAudio();
      return;
    }

    let audioUrl = message.audioUrl;

    if (!audioUrl && message.role === 'assistant') {
      setIsAudioPlaying(true);
      try {
        audioUrl = await generateAudio(message.content);

        if (audioUrl) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], audioUrl } as ChatMessage;
            return updated;
          });
        }
      } catch (error) {
        logMessage('warn', 'Failed to generate audio for message:', error);
        setIsAudioPlaying(false);
        return;
      }
    }

    if (audioUrl) {
      await playAudio(audioUrl);
    } else {
      setIsAudioPlaying(false);
    }
  };

  const processAiResponse = async (
    responseText: string,
    addToMessages = true,
    existingMessages: ChatMessage[] = [],
  ): Promise<ChatMessage> => {
    const newMsg: ChatMessage = {
      content: responseText,
      role: 'assistant',
      timestamp: new Date(),
    };

    if (audioEnabled) {
      setPendingAiMessage(newMsg);
      try {
        const audioUrl = await generateAudio(responseText);
        if (audioUrl) {
          const withAudio = { ...newMsg, audioUrl };
          if (addToMessages) {
            setMessages(existingMessages.length ? [...existingMessages, withAudio] : (prev) => [...prev, withAudio]);
          }
          setPendingAiMessage(null);

          // Only try to play audio if the component is still mounted and audio is enabled
          if (audioEnabled) {
            await playAudio(audioUrl);
          }
          markActivity();
          return withAudio;
        }
      } catch (error) {
        logMessage('warn', 'Audio generation failed, continuing with text only:', error);
      }
    }

    if (addToMessages) {
      setMessages(existingMessages.length ? [...existingMessages, newMsg] : (prev) => [...prev, newMsg]);
    }
    setPendingAiMessage(null);
    markActivity();
    return newMsg;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Skip if chat has ended or AI is currently processing
      if (chatEndedRef.current || isAiTyping || pendingAiMessage !== null) return;

      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      if (elapsed > silence_timeout_in_seconds * 1000 && !silenceTriggeredRef.current) {
        silenceTriggeredRef.current = true;
        void sendSilencePrompt();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAiTyping, pendingAiMessage, messages, consecutiveSilencePrompts]);

  const handleEndChatWithReason = async (reason?: 'timeLimit' | 'silence' | 'manual', messagesToSave?: ChatMessage[], logsToSave?: Log[]) => {
    stopAudio();
    stopRecognition();

    // Use passed messages and logs or current state
    const finalMessages = messagesToSave || messages;
    const finalLogs = logsToSave || conversationLogs;
    // Mark the chat as ended
    chatEndedRef.current = true;

    if (reason === 'timeLimit') {
      setEndedDueToTimeLimit(true);
    }

    // Save conversation to database
    if (reason) {
      await saveConversationToDatabase(reason, conversationType, finalMessages, finalLogs);
    }

    setShowTranscriptDialog(true);
  };

  useEffect(() => {
    const timeLimit = max_conversation_duration_in_seconds * 1000;
    const interval = setInterval(() => {
      // Skip if chat has already ended
      if (chatEndedRef.current) return;

      const now = Date.now();
      const chatDuration = now - chatStartTime;

      if (chatDuration > timeLimit) {
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
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [chatStartTime]);

  const sendSilencePrompt = async () => {
    if (!personality || !userProfile || chatEndedRef.current) return;
    logMessage('log', 'Sending silence prompt', { counter: consecutiveSilencePrompts });

    // Check if we've reached the maximum number of consecutive silence prompts
    if (consecutiveSilencePrompts >= MAX_CONSECUTIVE_SILENCE_PROMPTS) {
      const silenceSystemPrompt = t('chat.silencePromptGoodbye');
      // 'The user has been silent for too long. Respond with a short goodbye.';
      const aiText = await apiClient.getResponse({
        input_text: silenceSystemPrompt,
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

      // Add a log entry for the goodbye message
      const goodbyeLog: Log = {
        timestamp: new Date().toISOString(),
        level: 'log',
        message: 'Chat ending due to silence - sending goodbye message',
        data: { consecutiveSilencePrompts, aiText },
      };
      const finalLogs = [...conversationLogs, goodbyeLog];
      setConversationLogs(finalLogs);

      // Wait a moment before ending the chat, then pass the final messages and logs
      setTimeout(() => void handleEndChatWithReason('silence', finalMessages, finalLogs), 2000);
      return;
    }

    setConsecutiveSilencePrompts((prev) => prev + 1);
    setIsAiTyping(true);

    try {
      const silenceSystemPrompt = t('chat.silencePrompt');
      // 'The user has been silent for a few seconds. Respond with a short follow‑up.';
      const aiText = await apiClient.getResponse({
        input_text: silenceSystemPrompt,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      });

      if (aiText) await processAiResponse(aiText);
      else throw new Error('Empty response from AI');
    } catch (err) {
      logMessage('error', 'Error during silence prompt:', err);
      const fallback = t('chat.silencePromptFallback');
      setMessages((prev) => [
        ...prev,
        { content: fallback, role: 'assistant', timestamp: new Date() },
      ]);
      markActivity();
    } finally {
      setIsAiTyping(false);
    }
  };

  useEffect(() => {
    if (!initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      setTimeout(() => sendInitialAIMessage(personality, conversationRoleName), 1000);
    }
    setIsLoading(false);
    return () => {
      stopAudio();
      stopRecognition();
      // Save conversation on component unmount if not already saved
      if (!conversationSavedRef.current && messages.length > 0) {
        void saveConversationToDatabase('manual', conversationType, messages, conversationLogs);
      }
    };
    // eslint‑disable‑next‑line react‑hooks/exhaustive‑deps
  }, []);

  if (userProfile === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('chat.profileError')}
      </div>
    );
  }

  const sendInitialAIMessage = async (
    personality: Personality,
    conversationRole: string,
  ) => {
    if (messages.length > 0) return;
    setIsAiTyping(true);
    try {
      const aiText = await apiClient.getResponse({
        input_text: 'Just say hi',
        previousMessages: [],
        personality,
        conversationRole,
        language,
        scenario,
        userProfile,
      });
      if (aiText) {
        await processAiResponse(aiText, true, []);
      } else throw new Error('Empty response from AI');
    } catch (error) {
      setMessages([
        {
          content: handleAiError(error, t('chat.fallbackGreeting')),
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
      markActivity();
    } finally {
      setIsAiTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    resetSilenceCounter();
    const userMsg: ChatMessage = {
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsAiTyping(true);
    stopRecognition();
    markActivity(); // This will reset the silence counter

    try {
      const requestMessage = {
        input_text: userMsg.content,
        previousMessages: messages,
        personality,
        conversationRole: conversationRoleName,
        language,
        scenario,
        userProfile,
      };

      logMessage('log', 'Message chat - Request message:', requestMessage);
      const aiText = await apiClient.getResponse(requestMessage);
      if (aiText) await processAiResponse(aiText);
      else throw new Error('Empty response from AI');
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          content: handleAiError(error, t('chat.errors.aiResponseError')),
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
      markActivity();
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleAudioToggle = (checked: boolean) => {
    setAudioEnabled(checked);
    if (!checked) {
      stopAudio();
      if (pendingAiMessage) {
        setMessages((prev) => [...prev, pendingAiMessage]);
        setPendingAiMessage(null);
      }
    }
    markActivity(); // Reset silence counter
  };

  const toggleRecording = () => {
    if (!srSupported) {
      toast.error(t('chat.errors.browserNotSupported'));
      return;
    }

    if (isRecording) {
      stopRecognition();
    } else {
      setInputMessage('');
      startRecognition();
    }
    markActivity(); // Reset silence counter
  };

  const handleEndChat = () => {
    stopAudio();
    stopRecognition();
    void handleEndChatWithReason('manual');
  };

  const handleGoToPersonalitySelector = () => {
    setShowTranscriptDialog(false);
    navigate('/chat');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading/>
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

      <div className="w-full max-w-4xl mx-auto border-2 rounded-lg p-4 sm:p-8 flex flex-col flex-grow">
        <div className="border-b-2 pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold">
              {t('chat.chatWith', { name: personality.name })}
            </h1>
            <div className="flex items-center gap-2">
              <Label htmlFor="audio-toggle" className="text-sm text-gray-600">
                {audioEnabled ? t('chat.audioOn') : t('chat.audioOff')}
              </Label>
              <Switch
                id="audio-toggle"
                checked={audioEnabled}
                onCheckedChange={handleAudioToggle}
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
          isAiTyping={isAiTyping || (audioEnabled && pendingAiMessage !== null)}
          assistantName={personality.name}
          onPlayAudio={playMessageAudio}
          isAudioPlaying={isAudioPlaying}
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
            disabled={isAiTyping || isRecording || pendingAiMessage !== null}
          />

          <Button
            onClick={toggleRecording}
            className={`mr-2 p-2 rounded-full ${
              isRecording ?
                'bg-red-600 hover:bg-red-700' :
                'bg-purple-600 hover:bg-purple-700'
            } text-white`}
            disabled={!srSupported || isAiTyping || pendingAiMessage !== null}
          >
            {isRecording ? (
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
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-full"
            disabled={
              inputMessage.trim() === '' ||
                            isAiTyping ||
                            isRecording ||
                            pendingAiMessage !== null
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

        {audioEnabled && (
          <div className="mt-2 text-xs text-center text-gray-500">
            {t('chat.aiVoiceNote')}
          </div>
        )}
      </div>
    </ChatLayout>
  );
};

