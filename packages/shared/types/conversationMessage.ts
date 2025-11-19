/**
 * Represents a message stored in a conversation record.
 * This is the persisted format of a chat message.
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601 date string
}
