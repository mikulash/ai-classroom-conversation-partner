import { Module } from '@nestjs/common';
import { ConversationRolesController } from '../controllers/conversation-roles.controller';
import { PersonalitiesController } from '../controllers/personalities.controller';
import { ScenariosController } from '../controllers/scenarios.controller';
import { CatalogService } from '../services/catalog.service';

@Module({
  controllers: [PersonalitiesController, ScenariosController, ConversationRolesController],
  providers: [CatalogService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CatalogModule {}
