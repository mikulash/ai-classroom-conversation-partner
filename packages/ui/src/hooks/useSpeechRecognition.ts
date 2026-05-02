import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ConversationLogDtoLevelEnum } from '@repo/frontend-utils/src/clients/generated';

type LogMessageFn = (level: ConversationLogDtoLevelEnum, message: string, data?: Record<string, unknown>) => void;

const SpeechRecognitionClass: typeof SpeechRecognition | undefined = (() => {
  if ('SpeechRecognition' in globalThis) {
    return globalThis.SpeechRecognition;
  }
  if ('webkitSpeechRecognition' in globalThis) {
    return (globalThis as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
  }
  return undefined;
})();

interface UseSpeechRecognitionParams {
  /** BCP 47 language tag for the recognizer (e.g. "en-US"). */
  languageBCP47: string;
  logMessage: LogMessageFn;
  markActivity: () => void;
  /** Called whenever the recognizer produces a (possibly interim) transcript. */
  onTranscriptChange: (transcript: string) => void;
}

/**
 * Encapsulates the Web Speech Recognition API lifecycle.
 *
 * Responsibilities:
 * - Feature detection (srSupported)
 * - Creating and configuring SpeechRecognition
 * - Start / stop / toggle helpers
 * - Browser-support dialog visibility (set on network error)
 */
export const useSpeechRecognition = ({
  languageBCP47,
  logMessage,
  markActivity,
  onTranscriptChange,
}: UseSpeechRecognitionParams) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [srSupported, setSrSupported] = useState(Boolean(SpeechRecognitionClass));
  const [isBrowserDialogVisible, setIsBrowserDialogVisible] = useState(false);

  // Keep callback ref stable to avoid re-creating recognition on every render
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  onTranscriptChangeRef.current = onTranscriptChange;

  // Initialise SpeechRecognition
  useEffect(() => {
    if (!srSupported || !SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageBCP47;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      markActivity();
      onTranscriptChangeRef.current(transcript);
    };

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      logMessage('error', 'Speech recognition error', { error: ev.error });
      toast.error('Speech recognition failed; returning to chat list…');
      if (ev.error === 'network') {
        setIsBrowserDialogVisible(true);
        setSrSupported(false);
        setIsRecording(false);
      }
      recognition.stop();
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [languageBCP47, srSupported]);

  const startRecognition = useCallback(() => {
    if (!recognitionRef.current || isRecording) return;
    try {
      recognitionRef.current.lang = languageBCP47;
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      logMessage('error', 'Failed to start recognition', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [isRecording, languageBCP47, logMessage]);

  const stopRecognition = useCallback(() => {
    if (!recognitionRef.current || !isRecording) return;
    recognitionRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  return {
    isRecording,
    srSupported,
    isBrowserDialogVisible,
    setIsBrowserDialogVisible,
    startRecognition,
    stopRecognition,
  };
};
