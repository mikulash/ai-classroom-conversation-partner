import { ConversationLog } from '@repo/shared/types/conversationLog';
import { ConversationMessage } from '@repo/shared/types/conversationMessage';
import { AppConfig } from '@repo/shared/types/db/entities';

declare global {
  namespace PrismaJson {
    type ConversationMessages = ConversationMessage[];
    type ConversationLogs = ConversationLog[];
    type UsedConfig = AppConfig;
  }
}

export {};
