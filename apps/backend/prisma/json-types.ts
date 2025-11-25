import { ConversationLog } from '@repo/shared/types/conversationLog';
import { ConversationMessage } from '@repo/shared/types/conversationMessage';

declare global {
  namespace PrismaJson {
    type ConversationMessages = ConversationMessage[];
    type ConversationLogs = ConversationLog[];
  }
}

export {};
