export type logLevel = 'log' | 'error' | 'warn';

export interface ConversationLog {
    timestamp: string;
    level: logLevel;
    message: string;
    data?: Record<string, unknown>;
}
