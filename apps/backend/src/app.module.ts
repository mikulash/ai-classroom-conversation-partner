import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AuthController } from './controllers/auth.controller';
import { ProfilesController } from './controllers/profiles.controller';
import { ConversationsController } from './controllers/conversations.controller';
import { PersonalitiesController } from './controllers/personalities.controller';
import { ScenariosController } from './controllers/scenarios.controller';
import { ModelsController } from './controllers/models.controller';
import { AppConfigController } from './controllers/app-config.controller';
import { ConversationRolesController } from './controllers/conversation-roles.controller';
import { RepliesController } from './controllers/replies.controller';
import { HealthModule } from './health/health.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [HealthModule, TasksModule],
  controllers: [
    AppController,
    AuthController,
    ProfilesController,
    ConversationsController,
    PersonalitiesController,
    ScenariosController,
    ModelsController,
    AppConfigController,
    ConversationRolesController,
    RepliesController,
  ],
})
export class AppModule { }
