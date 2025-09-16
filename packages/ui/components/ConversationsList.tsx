import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatMessage } from '@repo/shared/types/chatMessage';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

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
    formatDateTime: (dateString: string) => string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  isLoading,
  onConversationClick,
  formatDateTime,
}) => {
  const { t } = useTypedTranslation();
  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t('loadingConversations', { defaultValue: 'Loading conversations...' })}
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t('noConversationsFound', { defaultValue: 'No conversations found' })}
      </div>
    );
  }

  const getConversationTypeStyles = (type: string) => {
    switch (type) {
      case 'VoiceOnly':
        return 'bg-purple-100 text-purple-800';
      case 'Video':
        return 'bg-red-100 text-red-800';
      case 'TextOnly':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800'; // Default for TextWithAudio or any other types
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4"/>
        {t('conversations', { defaultValue: 'Conversations' })} ({conversations.length})
      </h4>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className="bg-background p-3 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onConversationClick(conversation)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {conversation.personality?.name || 'Unknown Personality'}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${getConversationTypeStyles(conversation.conversation_type)}`}>
                  {conversation.conversation_type}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDateTime(conversation.start_time)} - {formatDateTime(conversation.end_time)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {conversation.messages.length} {t('messages', { defaultValue: 'messages' })} • {t('ended', { defaultValue: 'Ended' })}: {conversation.ended_reason}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

