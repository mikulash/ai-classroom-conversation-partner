import { Module } from '@nestjs/common';
import { RepliesController } from '../controllers/replies.controller';
import { RepliesService } from '../services/replies.service';
import { AiModule } from './ai.module';

@Module({
  imports: [AiModule],
  controllers: [RepliesController],
  providers: [RepliesService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class RepliesModule {}
