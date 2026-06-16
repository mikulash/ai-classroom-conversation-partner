import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { formatIsoStringToLocaleString } from '../lib/timeFormatters';

interface Conversation {
    id: number;
    start_time: string;
    end_time: string;
    ended_reason: string;
    conversation_type: string;
    messages: ChatMessage[];
    personality_id: number | null;
    personality: {
        name: string;
    } | null;
}

interface ConversationsListProps {
    conversations: Conversation[];
    isLoading: boolean;
    onConversationClick: (conversation: Conversation) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  isLoading,
  onConversationClick,
}) => {
  const { t } = useTypedTranslation();
  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t('common.loading.conversations', { defaultValue: 'Loading conversations...' })}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t('common.noConversationsFound', { defaultValue: 'No conversations found' })}
      </div>
    );
  }

  const getConversationTypeStyles = (type: string) => {
    switch (type) {
      case 'VoiceOnly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'Video':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      case 'TextOnly':
        return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      default:
        // Default for TextWithAudio or any other types
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4"/>
        {t('common.conversations', { defaultValue: 'Conversations' })} ({conversations.length})
      </h4>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          type="button"
          className="block w-full text-left bg-background p-3 rounded border cursor-pointer hover:bg-muted/50 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          onClick={() => {
            onConversationClick(conversation);
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {conversation.personality?.name ?? 'Unknown Personality'}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${getConversationTypeStyles(conversation.conversation_type)}`}>
                  {conversation.conversation_type}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatIsoStringToLocaleString(conversation.start_time)} - {formatIsoStringToLocaleString(conversation.end_time)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {conversation.messages.length} {t('common.messages', { defaultValue: 'messages' })} • {t('common.ended', { defaultValue: 'Ended' })}: {conversation.ended_reason}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

