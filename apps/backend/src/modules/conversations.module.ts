import { Module } from '@nestjs/common';
import { ConversationsController } from '../controllers/conversations.controller';
import { ConversationsService } from '../services/conversations.service';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConversationsModule {}
