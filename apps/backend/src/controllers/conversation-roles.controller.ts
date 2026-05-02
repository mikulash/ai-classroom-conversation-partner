import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ConversationRoleDto } from '../dtos/conversation-roles.dto';
import { CatalogService } from '../services/catalog.service';

@ApiTags('conversation-roles')
@Controller('api/conversation-roles')
export class ConversationRolesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOkResponse({ description: 'List all conversation roles', type: [ConversationRoleDto] })
  getConversationRoles(): Promise<ConversationRoleDto[]> {
    return this.catalogService.getConversationRoles();
  }
}
