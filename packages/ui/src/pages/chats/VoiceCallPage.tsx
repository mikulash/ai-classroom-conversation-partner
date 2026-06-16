import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MdCallEnd } from 'react-icons/md';
import { PersonalityInfo } from '../../components/PersonalityInfo';
import { ChatMessages } from '../../components/ChatMessages';
import { Button } from '../../components/ui/button';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { useAuth } from '../../hooks/useAuth';
import { ScenarioInfo } from '../../components/ScenarioInfo';
import { ChatPageProps } from '../../lib/types/ChatPageProps';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { useAppStore } from '../../hooks/useAppStore';
import { ChatLayout } from '../../layouts/ChatLayout';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { ChatPageWrapper } from '../../components/ChatPageWrapper';
import { useChatSession } from '../../hooks/useChatSession';
import { useChatTimeLimitMonitor } from '../../hooks/useChatTimeLimitMonitor';

const VoiceCallPageContent: React.FC<ChatPageProps> = ({ personality, conversationRoleName, scenario }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingInput, setIsProcessingInput] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [assistantTranscript, setAssistantTranscript] = useState('');
  const [isBrowserDialogVisible, setIsBrowserDialogVisible] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<number | null>(null);
  const isConnectingRef = useRef(false);

  const { t, language } = useTypedTranslation();
  const { profile: userProfile } = useAuth();
  const appConfig = useAppStore((state) => state.appConfig);
  const { maxConversationDurationInSeconds } = appConfig;

  // ── Composed hooks ─────────────────────────────────────────────────

  const {
    messages, setMessages,
    setConversationLogs,
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

  // ── WebRTC refs ────────────────────────────────────────────────────

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
    setChatStartTime(null);
  }, []);

  // ── Server event handling ──────────────────────────────────────────

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
  }, [logMessage, setMessages]);

  // ── WebRTC connection ──────────────────────────────────────────────

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

      if (!offer.sdp) {
        logMessage('error', 'Connection error', { error: 'No SDP offer received from server.' });
        setError('No SDP offer received from server.');
        setIsConnecting(false);
        disconnect();
        return;
      }

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
      isConnectingRef.current = false;
      setIsConnecting(false);
    }
  }, [isConnected, userProfile, logMessage, handleServerEvent, conversationRoleName, language, scenario, disconnect]);

  // ── End call ───────────────────────────────────────────────────────

  const handleEndCall = useCallback(() => {
    logMessage('log', 'handleEndCall: Ending call and showing transcript');
    disconnect();
    void handleEndChatWithReason('manual', 'VoiceOnly');
  }, [logMessage, disconnect, handleEndChatWithReason]);

  // ── Time limit ─────────────────────────────────────────────────────

  useChatTimeLimitMonitor({
    chatStartTime,
    maxDurationMs: maxConversationDurationInSeconds * 1000,
    hasChatEndedRef,
    onTimeLimitReached: useCallback((currentMessages, currentLogs) => {
      logMessage('log', 'Time limit reached - ending call');
      disconnect();
      void handleEndChatWithReason('timeLimit', 'VoiceOnly', currentMessages, currentLogs);
    }, [logMessage, disconnect, handleEndChatWithReason]),
    setMessages,
    setConversationLogs,
  });

  // ── Lifecycle ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      disconnect();
      if (!conversationSavedRef.current && messages.length > 0) {
        void saveConversationToDatabase('manual', 'VoiceOnly');
      }
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────

  const connectionStatusMessage = isConnecting ?
    t('call.connecting') :
    isConnected ?
      t('common.connected') :
      t('common.disconnected');

  const connectionStatus = (
    <div className="mt-4 space-y-1" role="status" aria-live="polite">
      <p className="text-lg">
        {t('common.status')}:{' '}
        <span className={`font-bold ${isConnected ? 'text-green-700 dark:text-green-400' : 'text-destructive'}`}>
          {connectionStatusMessage}
        </span>
      </p>
      {isProcessingInput && <p className="text-sm text-amber-700 dark:text-amber-400">{t('call.listening')}</p>}
      {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
    </div>
  );

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
        <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('call.voiceCall')}</h1>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1">
            <PersonalityInfo
              personality={personality}
              conversationRole={conversationRoleName}
              connectionStatus={connectionStatus}
              className="border-2 rounded-lg p-4 sm:p-6"
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
          className="h-48 sm:h-64 overflow-y-auto p-3 sm:p-4 border-2 rounded-lg mb-6 sm:mb-8"
        />

        <div className="flex justify-center gap-4">
          {!isConnected ? (
            <Button
              onClick={() => {
                void initializeWebRTC(personality);
              }}
              disabled={isConnecting}
              className="px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-xl bg-green-700 hover:bg-green-800 text-white rounded-md flex items-center"
            >
              <span className="mr-2">
                {isConnecting ? t('call.connecting') : t('call.connectCall')}
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleEndCall}
              className="px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-xl bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
              disabled={isSavingConversation}
            >
              <span className="mr-2">{t('call.endCall')}</span>
              <MdCallEnd className="inline-block align-middle" aria-hidden="true"/>
            </Button>
          )}
        </div>

        <div className="mt-2 text-xs sm:text-sm text-center text-muted-foreground">
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
