import React, { useCallback, useRef, useState } from 'react';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { TextToSpeechRequest } from '@repo/frontend-utils/src/figurantClient.types';
import { repliesClient } from '@repo/frontend-utils/src/clients/replies.client';
import { PersonalityModel } from '@repo/frontend-utils/src/models';
import { Language } from '@repo/frontend-utils/src/enums/Language';
import { ConversationLogDtoLevelEnum } from '@repo/frontend-utils/src/clients/generated';

type LogMessageFn = (level: ConversationLogDtoLevelEnum, message: string, data?: Record<string, unknown>) => void;

interface UseAudioPlaybackParams {
  personality: PersonalityModel;
  language: Language;
  logMessage: LogMessageFn;
  markActivity: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

/**
 * Encapsulates audio generation (TTS), playback, and the audio toggle for MessageChatPage.
 *
 * Responsibilities:
 * - Text-to-speech audio generation via repliesClient
 * - HTML Audio element lifecycle (play, pause, cleanup)
 * - Audio-enabled toggle and pending AI message state
 * - `processAiResponse` — adds an AI message to state with optional audio
 * - `playMessageAudio` — generates and plays audio for an existing message
 */
export const useAudioPlayback = ({
  personality,
  language,
  logMessage,
  markActivity,
  setMessages,
}: UseAudioPlaybackParams) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [pendingAiMessage, setPendingAiMessage] = useState<ChatMessage | null>(null);

  // ── Audio lifecycle ────────────────────────────────────────────────

  const handleAudioEnded = useCallback(() => {
    setIsAudioPlaying(false);
    audioRef.current = null;
  }, []);

  const handleAudioError = useCallback((error: Event) => {
    logMessage('warn', 'Audio playback error (non-critical)', { error: error.type });
    setIsAudioPlaying(false);
    audioRef.current = null;
  }, [logMessage]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.removeEventListener('ended', handleAudioEnded);
        audioRef.current.removeEventListener('error', handleAudioError);
      } catch (error) {
        logMessage('warn', 'Error stopping audio', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      audioRef.current = null;
      setIsAudioPlaying(false);
    }
  }, [logMessage, handleAudioEnded, handleAudioError]);

  // ── TTS generation ─────────────────────────────────────────────────

  const generateAudio = useCallback(async (text: string): Promise<string | null> => {
    try {
      const ttsParams: TextToSpeechRequest = {
        inputMessage: text,
        personality,
        language,
        responseFormat: 'mp3',
      };
      const audio = await repliesClient.getSpeechAudio(ttsParams);
      return audio.objectUrl;
    } catch (error) {
      logMessage('error', 'Error generating audio', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }, [personality, language, logMessage]);

  // ── Playback ───────────────────────────────────────────────────────

  const playAudio = useCallback(async (audioUrl: string): Promise<void> => {
    try {
      stopAudio();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('error', handleAudioError);
      setIsAudioPlaying(true);
      await audio.play();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logMessage('log', 'Audio playback was interrupted (normal behavior)');
      } else {
        logMessage('warn', 'Audio playback failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      setIsAudioPlaying(false);
      audioRef.current = null;
    }
  }, [stopAudio, handleAudioEnded, handleAudioError, logMessage]);

  const playMessageAudio = useCallback(async (message: ChatMessage, index: number) => {
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
        logMessage('warn', 'Failed to generate audio for message', {
          error: error instanceof Error ? error.message : String(error),
        });
        setIsAudioPlaying(false);
        return;
      }
    }

    if (audioUrl) {
      await playAudio(audioUrl);
    } else {
      setIsAudioPlaying(false);
    }
  }, [isAudioPlaying, stopAudio, generateAudio, playAudio, logMessage, setMessages]);

  // ── Process AI response with optional audio ────────────────────────

  const processAiResponse = useCallback(async (
    responseText: string,
    addToMessages = true,
    existingMessages: ChatMessage[] = [],
  ): Promise<ChatMessage> => {
    const newMsg: ChatMessage = {
      content: responseText,
      role: 'assistant',
      timestamp: new Date(),
    };

    if (isAudioEnabled) {
      setPendingAiMessage(newMsg);
      try {
        const audioUrl = await generateAudio(responseText);
        if (audioUrl) {
          const withAudio = { ...newMsg, audioUrl };
          if (addToMessages) {
            setMessages(existingMessages.length ? [...existingMessages, withAudio] : (prev) => [...prev, withAudio]);
          }
          setPendingAiMessage(null);
          await playAudio(audioUrl);
          markActivity();
          return withAudio;
        }
      } catch (error) {
        logMessage('warn', 'Audio generation failed, continuing with text only', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (addToMessages) {
      setMessages(existingMessages.length ? [...existingMessages, newMsg] : (prev) => [...prev, newMsg]);
    }
    setPendingAiMessage(null);
    markActivity();
    return newMsg;
  }, [isAudioEnabled, generateAudio, playAudio, setMessages, markActivity, logMessage]);

  // ── Audio toggle ───────────────────────────────────────────────────

  const handleAudioToggle = useCallback((checked: boolean) => {
    setIsAudioEnabled(checked);
    if (!checked) {
      stopAudio();
      if (pendingAiMessage) {
        setMessages((prev) => [...prev, pendingAiMessage]);
        setPendingAiMessage(null);
      }
    }
    markActivity();
  }, [stopAudio, pendingAiMessage, setMessages, markActivity]);

  return {
    isAudioPlaying,
    isAudioEnabled,
    pendingAiMessage,
    stopAudio,
    generateAudio,
    playAudio,
    playMessageAudio,
    processAiResponse,
    handleAudioToggle,
  };
};
