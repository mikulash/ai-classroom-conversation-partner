import { RealtimeConnection, RealtimeEvent } from '@repo/shared/types/realtimeConnection';
import type { logLevel } from '@repo/shared/types/conversationLog';
import type { TFunction } from 'i18next';
import type { SetStateAction } from 'react';

interface ProcessRealtimeTranscriptionEventParams {
    setIsTranscribing: (value: SetStateAction<boolean>) => void;
    handleTranscriptionCompleted: (transcript: string) => void;
    logMessage: (level: logLevel, message: string, data?: any, includeInRecord?: boolean) => void;
    setError: (value: SetStateAction<string | null>) => void;
    setCurrentTranscript: (value: SetStateAction<string>) => void;
    onUserActivity: () => void;
}

export const processRealtimeTranscriptionEvent = (
  event: RealtimeEvent,
  {
    setIsTranscribing,
    handleTranscriptionCompleted,
    logMessage,
    setError,
    setCurrentTranscript,
    onUserActivity,
  }: ProcessRealtimeTranscriptionEventParams,
) => {
  switch (event.type) {
    case 'error':
      logMessage('error', 'Realtime API error:', event.error);
      setError(event.error?.message || 'Unknown error occurred');
      break;

    case 'transcription_session.created':
      logMessage('log', 'Transcription session created', null, false);
      break;

    case 'transcription_session.updated':
      logMessage('log', 'Transcription session updated', null, false);
      break;

    case 'conversation.item.input_audio_transcription.delta':
      // For gpt-4o-transcribe or GPT-4o mini Transcribe, this will be incremental
      setCurrentTranscript((p) => p + event.delta);
      setIsTranscribing(true);
      onUserActivity();
      break;

    case 'conversation.item.input_audio_transcription.completed':
      setIsTranscribing(false);
      handleTranscriptionCompleted(event.transcript);
      break;

    case 'input_audio_buffer.committed':
      setIsTranscribing(true);
      break;

    case 'input_audio_buffer.speech_started':
      setIsTranscribing(true);
      onUserActivity();
      break;

    case 'input_audio_buffer.speech_stopped':
      onUserActivity();
      break;

    default:
      logMessage('log', 'Unhandled event:', { type: event.type, event: event });
      break;
  }
};

interface EmptyStateMessageParams {
    hasConversationStarted: boolean;
    error: string | null;
    isConnecting: boolean;
    connection: RealtimeConnection | null;
    t: TFunction;
}

export const getVoiceChatEmptyStateMessage = ({
  hasConversationStarted,
  error,
  isConnecting,
  connection,
  t,
}: EmptyStateMessageParams) => {
  if (!hasConversationStarted) {
    return t('clickStartConversation');
  }

  if (error) {
    return t('voiceDetectionError');
  }

  if (isConnecting || !connection) {
    return t('voiceDetectionInitializingMessage');
  }

  return t('startSpeaking');
};

interface StatusLabelParams {
    hasConversationStarted: boolean;
    error: string | null;
    isConnecting: boolean;
    connection: RealtimeConnection | null;
    isTranscribing: boolean;
    isAiProcessing: boolean;
    t: TFunction;
}

export const getVoiceChatStatusLabel = ({
  hasConversationStarted,
  error,
  isConnecting,
  connection,
  isTranscribing,
  isAiProcessing,
  t,
}: StatusLabelParams) => {
  if (!hasConversationStarted) {
    return [t('readyToStart'), 'text-gray-600'] as [string, string];
  }

  if (error) {
    return [t('voiceDetectionErrorStatus'), 'text-red-600'] as [string, string];
  }

  if (isConnecting || !connection) {
    return [t('voiceDetectionInitializingStatus'), 'text-blue-600'] as [string, string];
  }

  if (isTranscribing) {
    return [t('listeningToYou'), 'text-green-600'] as [string, string];
  }

  if (isAiProcessing) {
    return [t('aiProcessing'), 'text-purple-600'] as [string, string];
  }

  return [t('readyWaitingForSpeech'), 'text-blue-600'] as [string, string];
};

interface UiStatusMessageParams {
    hasConversationStarted: boolean;
    error: string | null;
    isConnecting: boolean;
    connection: RealtimeConnection | null;
    t: TFunction;
}

export const getVoiceChatUiStatusMessage = ({
  hasConversationStarted,
  error,
  isConnecting,
  connection,
  t,
}: UiStatusMessageParams) => {
  if (!hasConversationStarted) {
    return t('clickStartConversationFullMessage');
  }

  if (error) {
    return t('voiceDetectionFailedMessage');
  }

  if (isConnecting || !connection) {
    return t('voiceDetectionInitializingMessage');
  }

  return t('voiceDetectionActiveMessage');
};
