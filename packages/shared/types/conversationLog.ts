export interface ConversationLog {
    timestamp: string;
    level: logLevel;
    message: string;
    data?: unknown;
}

export type logLevel = 'log' | 'error' | 'warn';
