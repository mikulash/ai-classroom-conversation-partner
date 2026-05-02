import { Global, Module } from '@nestjs/common';
import { EnvConfigService } from './env-config.service';

@Global()
@Module({
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ConfigModule {}
