import React, { useCallback, useEffect, useState } from 'react';

const DEFAULT_MAX_CONSECUTIVE_SILENCE_PROMPTS = 2;

interface UseSilenceMonitorParams {
  /** Set to false to disable the monitor entirely (e.g. VoiceCallPage). */
  enabled: boolean;
  /** How long (in ms) before silence is considered detected. */
  silenceTimeoutMs: number;
  /** Maximum silence prompts before triggering limit-reached. */
  maxConsecutivePrompts?: number;
  /** Whether the AI is currently processing a response. */
  isAiProcessing: boolean;
  /** Ref indicating whether the chat has already ended. */
  hasChatEndedRef: React.MutableRefObject<boolean>;
  /** Timestamp of the last user activity. */
  lastActivityRef: React.MutableRefObject<number>;
  /** Whether a silence prompt has already been triggered for the current silence window. */
  silenceTriggeredRef: React.MutableRefObject<boolean>;
  /**
   * Called when silence is detected and the consecutive-prompt limit has NOT been reached.
   * The counter is incremented automatically before this callback fires.
   */
  onSilencePrompt: () => Promise<void>;
  /**
   * Called when silence is detected and the consecutive-prompt limit HAS been reached.
   */
  onSilenceLimitReached: () => Promise<void>;
}

/**
 * Monitors user activity and triggers silence prompts when the user is inactive.
 *
 * Manages the consecutive-silence-prompt counter internally.
 * Pages provide `onSilencePrompt` and `onSilenceLimitReached` callbacks
 * for their page-specific AI interaction and goodbye logic.
 */
export const useSilenceMonitor = ({
  enabled,
  silenceTimeoutMs,
  maxConsecutivePrompts = DEFAULT_MAX_CONSECUTIVE_SILENCE_PROMPTS,
  isAiProcessing,
  hasChatEndedRef,
  lastActivityRef,
  silenceTriggeredRef,
  onSilencePrompt,
  onSilenceLimitReached,
}: UseSilenceMonitorParams) => {
  const [consecutiveSilencePrompts, setConsecutiveSilencePrompts] = useState(0);

  const resetSilencePrompts = useCallback(() => {
    setConsecutiveSilencePrompts(0);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (hasChatEndedRef.current || isAiProcessing) return;

      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed > silenceTimeoutMs && !silenceTriggeredRef.current) {
        silenceTriggeredRef.current = true;

        if (consecutiveSilencePrompts >= maxConsecutivePrompts) {
          void onSilenceLimitReached();
        } else {
          setConsecutiveSilencePrompts((prev) => prev + 1);
          void onSilencePrompt();
        }
      }
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, [
    enabled,
    silenceTimeoutMs,
    maxConsecutivePrompts,
    isAiProcessing,
    hasChatEndedRef,
    lastActivityRef,
    silenceTriggeredRef,
    consecutiveSilencePrompts,
    onSilencePrompt,
    onSilenceLimitReached,
  ]);

  return {
    consecutiveSilencePrompts,
    resetSilencePrompts,
  };
};
