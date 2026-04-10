import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { PersonalityInfo } from '../../components/PersonalityInfo';
import { ChatMessages } from '../../components/ChatMessages';
import { Button } from '../../components/ui/button';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { useAuth } from '../../hooks/useAuth';
import { ScenarioInfo } from '../../components/ScenarioInfo';
import { ChatPageProps } from '../../lib/types/ChatPageProps';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useAppStore } from '../../hooks/useAppStore';
import { useConversationLogger } from '../../hooks/useConversationLogger';
import { ChatLayout } from '../../layouts/ChatLayout';
import { useConversationSaver } from '../../hooks/useConversationSaver';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { ChatPageWrapper } from '../../components/ChatPageWrapper';
import { ConversationLogDto } from '@repo/frontend-utils/src/clients/generated';

const VoiceCallPageContent: React.FC<ChatPageProps> = ({ personality, conversationRoleName, scenario }) => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');

  const [isBrowserDialogVisible, setIsBrowserDialogVisible] = useState(false);
  const [isTranscriptDialogVisible, setIsTranscriptDialogVisible] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<number | null>(null);
  const [hasEndedDueToTimeLimit, setHasEndedDueToTimeLimit] = useState(false);
  const hasChatEndedRef = useRef<boolean>(false);
  const isConnectingRef = useRef(false);

  const { t, language } = useTypedTranslation();
  const { profile: userProfile } = useAuth();
  const appConfig = useAppStore((state) => state.appConfig);
  const { maxConversationDurationInSeconds } = appConfig;

  const { conversationLogs, setConversationLogs, logMessage } = useConversationLogger();

  const { isSavingConversation, conversationSavedRef, saveConversationToDatabase } = useConversationSaver({
    userProfile,
    personality,
    scenario,
    chatStartTime: chatStartTime ?? Date.now(),
    logMessage,
  });

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const disconnect = useCallback(() => {
    if (dataChannelRef.current) dataChannelRef.current.close();
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => {
        t.stop();
      });
    }
    dataChannelRef.current = null;
    peerConnectionRef.current = null;
    mediaStreamRef.current = null;
    setIsConnected(false);
    setCurrentTranscript('');
    setAssistantTranscript('');
    setIsProcessingInput(false);
    // Reset chat start time when disconnecting
    setChatStartTime(null);
  }, [logMessage]);

  const handleServerEvent = useCallback((e: MessageEvent) => {
    try {
      const ev = JSON.parse(String(e.data)) as { type: string; [key: string]: unknown };

      switch (ev.type) {
        case 'error': {
          const errorData = ev.error as { message?: string } | undefined;
          logMessage('error', 'Server error', { error: ev.error });
          setError(`Server error: ${errorData?.message ?? 'Unknown'}`);
          break;
        }
        case 'conversation.item.created': {
          const item = ev.item as { type?: string; role?: string } | undefined;
          if (item?.type === 'message' && item.role === 'assistant') {
            setIsProcessing(true);
            setAssistantTranscript('');
          }
          break;
        }
        case 'response.audio_transcript.done': {
          const transcript = typeof ev.transcript === 'string' ? ev.transcript : '';
          setMessages((p) => [...p, { role: 'assistant', content: transcript, timestamp: new Date() }]);
          setIsProcessing(false);
          setAssistantTranscript('');
          break;
        }
        case 'conversation.item.input_audio_transcription.completed': {
          const transcript = typeof ev.transcript === 'string' ? ev.transcript : '';
          setMessages((p) => [...p, { role: 'user', content: transcript, timestamp: new Date() }]);
          setCurrentTranscript('');
          break;
        }
        case 'input_audio_buffer.speech_started':
          setIsProcessingInput(true);
          setCurrentTranscript('');
          break;
        case 'input_audio_buffer.speech_stopped':
          setIsProcessingInput(false);
          break;
        default:
          break;
      }
    } catch (err) {
      logMessage('error', 'Error parsing server event', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [logMessage]);

  const initializeWebRTC = useCallback(async (personality: PersonalityModel) => {
    if (isConnected || isConnectingRef.current || !userProfile) return;
    try {
      isConnectingRef.current = true;
      setIsConnecting(true);
      setError(null);
      logMessage('log', 'Initializing WebRTC connection');

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = ms;
      ms.getTracks().forEach((track) => pc.addTrack(track, ms));

      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;
      dc.onopen = () => {
        logMessage('log', 'Data channel opened - connection established');
        setIsConnected(true);
        setIsConnecting(false);
        // Start the conversation timer after the connection is established
        setChatStartTime(Date.now());
      };

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0] || null;
      };
      dc.onclose = () => {
        logMessage('log', 'Data channel closed');
        setIsConnected(false);
      };
      dc.onmessage = handleServerEvent;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (!offer.sdp) throw new Error('No SDP offer received from server.');

      const response = await repliesClient.getWebRtcAnswer({
        openai_voice_name: personality.openaiVoiceName,
        personality,
        language,
        conversationRole: conversationRoleName,
        scenario,
        userProfile,
        sdp_offer: offer.sdp,
      });
      await pc.setRemoteDescription({ type: 'answer', sdp: response.sdp });
    } catch (err) {
      logMessage('error', 'Connection error', {
        error: err instanceof Error ? err.message : String(err),
      });
      setError(err instanceof Error ? err.message : 'Unknown connection error');
      setIsConnecting(false);
      disconnect();
    } finally {
      isConnectingRef.current = false; // release guard
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, userProfile, logMessage, handleServerEvent, conversationRoleName, language, scenario]);

  const handleEndCallWithReason = useCallback(async (
    reason?: 'timeLimit' | 'manual',
    messagesToSave?: ChatMessage[],
    logsToSave?: ConversationLogDto[],
  ) => {
    logMessage('log', `Ending call with reason: ${reason}`);

    disconnect();

    const finalMessages = messagesToSave ?? messages;
    const finalLogs = logsToSave ?? conversationLogs;

    // Mark the chat as ended
    hasChatEndedRef.current = true;

    if (reason === 'timeLimit') {
      setHasEndedDueToTimeLimit(true);
    }

    if (reason) {
      await saveConversationToDatabase(reason, 'VoiceOnly', finalMessages, finalLogs);
    }

    setIsTranscriptDialogVisible(true);
  }, [logMessage, messages, conversationLogs, saveConversationToDatabase]);

  const handleGoToPersonalitySelector = useCallback(() => {
    setIsTranscriptDialogVisible(false);
    void navigate('/chat');
  }, [navigate]);

  const handleEndCall = useCallback(() => {
    logMessage('log', 'handleEndCall: Ending call and showing transcript');
    void handleEndCallWithReason('manual');
  }, [logMessage, handleEndCallWithReason]);

  useEffect(() => {
    setIsLoading(false);
    return () => {
      disconnect();
      // Save conversation on component unmount if not already saved
      if (!conversationSavedRef.current && messages.length > 0) {
        void saveConversationToDatabase('manual', 'VoiceOnly');
      }
    };
  }, []);

  useEffect(() => {
    if (!chatStartTime) return;

    const timeLimit = maxConversationDurationInSeconds * 1000;
    const interval = setInterval(() => {
      // Skip if chat has already ended
      if (hasChatEndedRef.current) {
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const chatDuration = now - chatStartTime;

      if (chatDuration > timeLimit) {
        logMessage('log', 'Time limit reached - ending call');
        clearInterval(interval);
        // Get current messages and logs before ending
        setMessages((currentMessages) => {
          setConversationLogs((currentLogs) => {
            void handleEndCallWithReason('timeLimit', currentMessages, currentLogs);
            return currentLogs;
          });
          return currentMessages;
        });
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(interval);
    };
  }, [chatStartTime, maxConversationDurationInSeconds, hasChatEndedRef, logMessage, handleEndCallWithReason]);

  const connectionStatusMessage = isConnecting ?
    'Connecting...' :
    isConnected ?
      'Connected' :
      'Disconnected';

  const connectionStatus = (
    <div className="mt-4 space-y-1">
      <p className="text-lg">
        {t('status')}:{' '}
        <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {connectionStatusMessage}
        </span>
      </p>
      {isProcessingInput && <p className="text-sm text-yellow-600">{t('listening')}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );

  return (
    <ChatLayout
      isLoading={isLoading}
      isBrowserDialogVisible={isBrowserDialogVisible}
      setIsBrowserDialogVisible={setIsBrowserDialogVisible}
      isTranscriptDialogVisible={isTranscriptDialogVisible}
      setIsTranscriptDialogVisible={setIsTranscriptDialogVisible}
      hasEndedDueToTimeLimit={hasEndedDueToTimeLimit}
      isSavingConversation={isSavingConversation}
      messages={messages}
      onGoToPersonalitySelector={handleGoToPersonalitySelector}
      mode="chat"
    >
      <div className="w-full max-w-4xl mx-auto border-2 rounded-lg p-4 sm:p-8">
        <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('voiceCall')}</h1>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1">
            <PersonalityInfo
              personality={personality}
              conversationRole={conversationRoleName}
              connectionStatus={connectionStatus}
              className="border-2 border-gray-400 rounded-lg p-4 sm:p-6"
            />
          </div>

          <ScenarioInfo scenario={scenario}/>
        </div>

        <ChatMessages
          messages={messages}
          currentTranscript={currentTranscript}
          assistantTranscript={assistantTranscript}
          isProcessing={isProcessing}
          assistantName={personality.name}
          chatStyle="voice"
          isConnected={isConnected}
          className="h-48 sm:h-64 overflow-y-auto p-3 sm:p-4 border-2 border-gray-400 rounded-lg mb-6 sm:mb-8"
        />

        <div className="flex justify-center gap-4">
          {!isConnected ? (
            <Button
              onClick={() => {
                void initializeWebRTC(personality);
              }}
              disabled={isConnecting}
              className="px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-xl bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
            >
              <span className="mr-2">
                {isConnecting ? t('connecting') : t('connectCall')}
              </span>
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
          {t('chat.speechRecognitionNote')}
        </div>
      </div>
    </ChatLayout>
  );
};

export const VoiceCallPage: React.FC = () => {
  return (
    <ChatPageWrapper>
      {(props) => <VoiceCallPageContent {...props} />}
    </ChatPageWrapper>
  );
};
