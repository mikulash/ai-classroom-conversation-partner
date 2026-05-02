import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth.module';
import { ProfilesModule } from './modules/profiles.module';
import { ConversationsModule } from './modules/conversations.module';
import { CatalogModule } from './modules/catalog.module';
import { ModelsModule } from './modules/models.module';
import { AppConfigModule } from './modules/app-config.module';
import { RepliesModule } from './modules/replies.module';

@Module({
  imports: [
    CoreModule,
    HealthModule,
    TasksModule,
    AuthModule,
    ProfilesModule,
    ConversationsModule,
    CatalogModule,
    ModelsModule,
    AppConfigModule,
    RepliesModule,
  ],
  controllers: [AppController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
