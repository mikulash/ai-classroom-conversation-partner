import { useEffect } from 'react';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { ConversationLogDto } from '@repo/frontend-utils/src/clients/generated';

interface UseChatTimeLimitMonitorParams {
  /** When the chat started (null = not yet started, skip monitoring). */
  chatStartTime: number | null;
  /** Maximum conversation duration in milliseconds. */
  maxDurationMs: number;
  /** Ref that indicates whether the chat has already ended. */
  hasChatEndedRef: React.MutableRefObject<boolean>;
  /**
   * Called when the time limit is reached.
   * Receives current message and log snapshots obtained via state-setter callbacks
   * to avoid stale-closure issues.
   */
  onTimeLimitReached: (currentMessages: ChatMessage[], currentLogs: ConversationLogDto[]) => void;
  /** State setter for messages — used only to read the current value via callback pattern. */
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  /** State setter for logs — used only to read the current value via callback pattern. */
  setConversationLogs: React.Dispatch<React.SetStateAction<ConversationLogDto[]>>;
}

/**
 * Monitors the elapsed chat duration and fires `onTimeLimitReached` when it exceeds `maxDurationMs`.
 *
 * Uses the state-setter callback pattern to obtain current message/log snapshots,
 * avoiding stale closures in the interval callback.
 */
export const useChatTimeLimitMonitor = ({
  chatStartTime,
  maxDurationMs,
  hasChatEndedRef,
  onTimeLimitReached,
  setMessages,
  setConversationLogs,
}: UseChatTimeLimitMonitorParams): void => {
  useEffect(() => {
    if (chatStartTime === null) return;

    const interval = setInterval(() => {
      if (hasChatEndedRef.current) {
        clearInterval(interval);
        return;
      }

      const chatDuration = Date.now() - chatStartTime;
      if (chatDuration > maxDurationMs) {
        clearInterval(interval);
        // Use setter callbacks to read current state without stale closures
        setMessages((currentMessages) => {
          setConversationLogs((currentLogs) => {
            onTimeLimitReached(currentMessages, currentLogs);
            return currentLogs;
          });
          return currentMessages;
        });
      }
    }, 10_000);

    return () => {
      clearInterval(interval);
    };
  }, [chatStartTime, maxDurationMs, hasChatEndedRef, onTimeLimitReached, setMessages, setConversationLogs]);
};
