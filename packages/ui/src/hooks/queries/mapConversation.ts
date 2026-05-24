import { ConversationModel } from '@repo/frontend-utils/src/models';
import { ChatMessage } from '@repo/frontend-utils/src/chatMessage';
import { MyConversation } from '@repo/frontend-utils/src/myConversation';

const toIsoString = (value: Date | string | null | undefined): string => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

export const mapConversation = (conv: ConversationModel): MyConversation => ({
  id: conv.id,
  start_time: toIsoString(conv.startTime),
  end_time: toIsoString(conv.endTime),
  ended_reason: conv.endedReason,
  conversation_type: conv.conversationType,
  messages: Array.isArray(conv.messages) ? (conv.messages as unknown as ChatMessage[]) : [],
  personality_id: conv.personalityId,
  personality: conv.personality ? { name: conv.personality.name } : null,
});
