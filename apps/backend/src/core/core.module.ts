import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { ConfigProvider } from '../utils/configProvider';
import { TokenService } from '../services/token.service';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [RateLimitGuard, ConfigProvider, TokenService],
  exports: [ConfigModule, PrismaModule, RateLimitGuard, ConfigProvider, TokenService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CoreModule {}
