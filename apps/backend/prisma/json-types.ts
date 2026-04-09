import {ConversationLogDto, ConversationMessageDto} from "../src/dtos/conversations.dto";

declare global {
  namespace PrismaJson {
    type ConversationMessages = ConversationMessageDto[];
    type ConversationLogs = ConversationLogDto[];
  }
}

export {};
