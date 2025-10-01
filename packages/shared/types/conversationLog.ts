import { Json } from './supabase/database.types';

export interface ConversationLog {
    timestamp: string;
    level: logLevel;
    message: string;
    data?: Json;
}

export type logLevel = 'log' | 'error' | 'warn';
