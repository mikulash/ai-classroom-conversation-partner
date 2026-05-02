import { Module } from '@nestjs/common';
import { ModelsController } from '../controllers/models.controller';
import { ModelsService } from '../services/models.service';
import { AiModule } from './ai.module';

@Module({
  imports: [AiModule],
  controllers: [ModelsController],
  providers: [ModelsService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ModelsModule {}
