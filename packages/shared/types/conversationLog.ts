import { Json } from './supabase/database.types.js';

export interface ConversationLog {
    timestamp: string;
    level: logLevel;
    message: string;
    data?: Json;
}

export type logLevel = 'log' | 'error' | 'warn';
