import { Module } from '@nestjs/common';
import { AppConfigController } from '../controllers/app-config.controller';
import { AppConfigService } from '../services/app-config.service';
import { AiModule } from './ai.module';

@Module({
  imports: [AiModule],
  controllers: [AppConfigController],
  providers: [AppConfigService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppConfigModule {}
