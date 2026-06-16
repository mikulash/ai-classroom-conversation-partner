import type { RealtimeConnection, RealtimeEvent } from './types/realtimeConnection';
import type { TFunction } from 'i18next';
import type { SetStateAction } from 'react';
import { ConversationLogDtoLevelEnum } from '@repo/frontend-utils/src/clients/generated';

interface ProcessRealtimeTranscriptionEventParams {
    setIsTranscribing: (value: SetStateAction<boolean>) => void;
    handleTranscriptionCompleted: (transcript: string) => void;
    logMessage: (level: ConversationLogDtoLevelEnum, message: string, data?: Record<string, unknown>, includeInRecord?: boolean) => void;
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
    case 'error': {
      const errorData = event.error as { message?: string } | undefined;
      logMessage('error', 'Realtime API error', { error: event.error });
      setError(errorData?.message ?? 'Unknown error occurred');
      break;
    }

    case 'transcription_session.created':
      logMessage('log', 'Transcription session created', undefined, false);
      break;

    case 'transcription_session.updated':
      logMessage('log', 'Transcription session updated', undefined, false);
      break;

    case 'conversation.item.input_audio_transcription.delta':
      // For gpt-4o-transcribe or GPT-4o mini Transcribe, this will be incremental
      setCurrentTranscript((p) => p + (typeof event.delta === 'string' ? event.delta : ''));
      setIsTranscribing(true);
      onUserActivity();
      break;

    case 'conversation.item.input_audio_transcription.completed':
      setIsTranscribing(false);
      handleTranscriptionCompleted(typeof event.transcript === 'string' ? event.transcript : '');
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
    return t('call.clickStartConversation');
  }

  if (error) {
    return t('call.voiceDetection.error');
  }

  if (isConnecting || !connection) {
    return t('call.voiceDetection.initializingMessage');
  }

  return t('call.startSpeaking');
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
    return [t('call.readyToStart'), 'text-muted-foreground'] as [string, string];
  }

  if (error) {
    return [t('call.voiceDetection.errorStatus'), 'text-destructive'] as [string, string];
  }

  if (isConnecting || !connection) {
    return [t('call.voiceDetection.initializingStatus'), 'text-blue-700 dark:text-blue-400'] as [string, string];
  }

  if (isTranscribing) {
    return [t('call.listeningToYou'), 'text-green-700 dark:text-green-400'] as [string, string];
  }

  if (isAiProcessing) {
    return [t('common.aiProcessing'), 'text-purple-700 dark:text-purple-400'] as [string, string];
  }

  return [t('call.readyWaitingForSpeech'), 'text-blue-700 dark:text-blue-400'] as [string, string];
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
    return t('call.clickStartConversationFullMessage');
  }

  if (error) {
    return t('call.voiceDetection.failedMessage');
  }

  if (isConnecting || !connection) {
    return t('call.voiceDetection.initializingMessage');
  }

  return t('call.voiceDetection.activeMessage');
};
