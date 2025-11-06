export interface ConversationLog {
    timestamp: string;
    level: logLevel;
    message: string;
    data?: object;
}

export type logLevel = 'log' | 'error' | 'warn';
