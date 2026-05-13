import { Module } from '@nestjs/common';
import { ConversationRolesController } from '../controllers/conversation-roles.controller';
import { PersonalitiesController, PersonalityAvatarsController } from '../controllers/personalities.controller';
import { ScenariosController } from '../controllers/scenarios.controller';
import { CatalogService } from '../services/catalog.service';
import { AvatarStorageService } from '../services/avatar-storage.service';

@Module({
  controllers: [PersonalitiesController, PersonalityAvatarsController, ScenariosController, ConversationRolesController],
  providers: [CatalogService, AvatarStorageService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CatalogModule {}
