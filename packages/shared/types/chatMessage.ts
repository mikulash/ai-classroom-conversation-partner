export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  audioUrl?: string | null;
}
