import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import prisma from '../clients/prisma';
import { ErrorResponse } from '../types/api.types';
import { ConversationRoleDto } from '../dtos/conversation-roles.dto';
import { conversationRoleEntityToDto } from '../utils/entityToDtoMappers';

@ApiTags('conversation-roles')
@Controller('api/conversation-roles')
export class ConversationRolesController {
  @Get()
  @ApiOkResponse({ description: 'List all conversation roles', type: [ConversationRoleDto] })
  async getConversationRoles(
    @Res() res: Response<ConversationRoleDto[] | ErrorResponse>,
  ): Promise<void> {
    try {
      const roles = await prisma.conversationRole.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(roles.map(conversationRoleEntityToDto));
    } catch (error) {
      console.error('Get conversation roles error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

