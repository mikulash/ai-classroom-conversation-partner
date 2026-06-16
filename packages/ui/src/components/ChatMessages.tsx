import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { IoVolumeMediumOutline, IoVolumeOffOutline } from 'react-icons/io5';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

interface ChatMessagesProps {
    messages: ChatMessage[];
    currentTranscript?: string;
    assistantTranscript?: string;
    isProcessing?: boolean;
    isAiTyping?: boolean;
    assistantName: string;
    onPlayAudio?: (message: ChatMessage, index: number) => void;
    isAudioPlaying?: boolean;
    chatStyle?: 'voice' | 'text';
    isConnected?: boolean;
    emptyStateMessage?: string;
    className?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentTranscript = '',
  assistantTranscript = '',
  isProcessing = false,
  isAiTyping = false,
  assistantName,
  onPlayAudio,
  isAudioPlaying = false,
  chatStyle = 'voice',
  isConnected = true,
  emptyStateMessage,
  className = 'h-64 overflow-y-auto p-4 border-2 rounded-lg',
}) => {
  const { t } = useTypedTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping, currentTranscript, assistantTranscript]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
    }
  };

  const defaultEmptyStateMessage = isConnected ?
    t('call.speakToBeginConversation') :
    t('call.connectToBeginConversation');

  const lastMessageContent =
        messages.length > 0 ? messages[messages.length - 1].content : '';

  const renderVoiceChat = () => (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            msg.role === 'user' ?
              'bg-primary/10 text-foreground ml-8' :
              'bg-muted text-foreground mr-8'
          }`}
        >
          <div className="font-semibold mb-1">
            {msg.role === 'user' ? t('common.you') : assistantName}
          </div>
          <div>{msg.content}</div>
        </div>
      ))}

      {currentTranscript && currentTranscript !== lastMessageContent && (
        <div className="p-3 rounded-lg bg-primary/5 text-foreground ml-8 border border-primary/20">
          <div className="font-semibold mb-1">
            {t('common.you')} ({t('call.listening')})
          </div>
          <div>{currentTranscript}</div>
        </div>
      )}

      {assistantTranscript && (
        <div className="p-3 rounded-lg bg-muted/50 text-foreground mr-8 border">
          <div className="font-semibold mb-1">
            {assistantName} ({t('call.listening')})
          </div>
          <div>{assistantTranscript}</div>
        </div>
      )}

      {isProcessing && !currentTranscript && !assistantTranscript && (
        <div className="bg-muted text-foreground p-3 rounded-lg mr-8">
          <div className="font-semibold mb-1">{t('common.aiProcessing')}</div>
          <div className="flex space-x-2" aria-hidden="true">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTextChat = () => (
    <div className="flex flex-col space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              msg.role === 'user' ?
                'bg-primary text-primary-foreground rounded-br-none' :
                'bg-muted text-foreground rounded-bl-none'
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="mr-2">{msg.content}</p>
              {msg.role === 'assistant' && msg.audioUrl && onPlayAudio && (
                <button
                  onClick={() => {
                    onPlayAudio(msg, index);
                  }}
                  className="ml-1 p-2 -m-1 rounded-full hover:bg-accent transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  aria-label={
                    isAudioPlaying ? t('chat.stopMessageAudio') : t('chat.playMessageAudio')
                  }
                  title={
                    isAudioPlaying ? t('chat.stopMessageAudio') : t('chat.playMessageAudio')
                  }
                >
                  {isAudioPlaying &&
                                    index ===
                                    messages.findIndex((m) => m.audioUrl === msg.audioUrl) ? (
                      <IoVolumeOffOutline size={16} aria-hidden="true"/>
                    ) : (
                      <IoVolumeMediumOutline size={16} aria-hidden="true"/>
                    )}
                </button>
              )}
            </div>
            {msg.timestamp && (
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
      ))}

      {isAiTyping && (
        <div className="flex justify-start">
          <div className="bg-muted text-foreground p-3 rounded-lg rounded-bl-none max-w-[70%]">
            <span className="sr-only">{t('chat.isTyping', { name: assistantName })}</span>
            <div className="flex space-x-1" aria-hidden="true">
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '0s' }}
              ></div>
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={className} ref={chatContainerRef} role="log" aria-live="polite">
      {messages.length === 0 &&
            !currentTranscript &&
            !assistantTranscript &&
            !isAiTyping ? (
          <div className="text-muted-foreground text-center py-8">
            {emptyStateMessage ?? defaultEmptyStateMessage}
          </div>
        ) : chatStyle === 'voice' ? (
          renderVoiceChat()
        ) : (
          renderTextChat()
        )}
      <div ref={messagesEndRef}/>
    </div>
  );
};

