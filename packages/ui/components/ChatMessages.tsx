import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@repo/shared/types/chatMessage';
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

const ChatMessages: React.FC<ChatMessagesProps> = ({
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
  className = 'h-64 overflow-y-auto p-4 border-2 border-gray-400 rounded-lg',
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
    t('speakToBeginConversation') :
    t('connectToBeginConversation');

  const lastMessageContent =
      messages.length > 0 ? messages[messages.length - 1].content : '';

  const renderVoiceChat = () => (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${
            msg.role === 'user' ?
              'bg-blue-100 text-blue-800 ml-8' :
              'bg-gray-100 text-gray-800 mr-8'
          }`}
        >
          <div className="font-semibold mb-1">
            {msg.role === 'user' ? t('you') : assistantName}
          </div>
          <div>{msg.content}</div>
        </div>
      ))}

      {currentTranscript && currentTranscript !== lastMessageContent && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-800 ml-8 border border-blue-200">
          <div className="font-semibold mb-1">
            {t('you')} ({t('listeningActive')})
          </div>
          <div>{currentTranscript}</div>
        </div>
      )}

      {assistantTranscript && (
        <div className="p-3 rounded-lg bg-gray-50 text-gray-800 mr-8 border border-gray-200">
          <div className="font-semibold mb-1">
            {assistantName} ({t('listeningActive')})
          </div>
          <div>{assistantTranscript}</div>
        </div>
      )}

      {isProcessing && !currentTranscript && !assistantTranscript && (
        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg mr-8">
          <div className="font-semibold mb-1">{t('aiProcessing')}</div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
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
                'bg-blue-500 text-white rounded-br-none' :
                'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="mr-2">{msg.content}</p>
              {msg.role === 'assistant' && msg.audioUrl && onPlayAudio && (
                <button
                  onClick={() => onPlayAudio(msg, index)}
                  className="ml-1 p-1 rounded-full hover:bg-gray-300 transition-colors"
                  title={
                    isAudioPlaying ? t('chat.stopRecording') : t('chat.startRecording')
                  }
                >
                  {isAudioPlaying &&
                  index ===
                    messages.findIndex((m) => m.audioUrl === msg.audioUrl) ? (
                      <IoVolumeOffOutline size={16} />
                    ) : (
                      <IoVolumeMediumOutline size={16} />
                    )}
                </button>
              )}
            </div>
            {msg.timestamp && (
              <p
                className={`text-xs mt-1 ${
                  msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
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
          <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[70%]">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: '0s' }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={className} ref={chatContainerRef}>
      {messages.length === 0 &&
      !currentTranscript &&
      !assistantTranscript &&
      !isAiTyping ? (
          <div className="text-gray-500 text-center py-8">
            {emptyStateMessage || defaultEmptyStateMessage}
          </div>
        ) : chatStyle === 'voice' ? (
          renderVoiceChat()
        ) : (
          renderTextChat()
        )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
