import { ChatMessage } from './chatMessage';

export interface MyConversation {
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
