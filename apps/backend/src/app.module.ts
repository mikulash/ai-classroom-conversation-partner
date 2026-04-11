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
import { AnthropicApiService } from './ai-api/anthropicApi';
import { ElevenLabsApiService } from './ai-api/elevenLabsApi';
import { OpenAiApiService } from './ai-api/openAiApi';
import { UniversalApiService } from './ai-api/universalApi';
import { XAiApiService } from './ai-api/xAiApi';
import { ClaudeClientProvider } from './clients/claude';
import { GrokClientProvider } from './clients/grok';
import { OpenAiClientProvider } from './clients/openAi';
import { ConfigProvider } from './utils/configProvider';

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
  providers: [
    ConfigProvider,
    OpenAiClientProvider,
    ClaudeClientProvider,
    GrokClientProvider,
    OpenAiApiService,
    AnthropicApiService,
    XAiApiService,
    ElevenLabsApiService,
    UniversalApiService,
  ],
})
export class AppModule { }
