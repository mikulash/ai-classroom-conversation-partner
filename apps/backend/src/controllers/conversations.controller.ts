import { Controller, Delete, Get, Param, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import prisma from '../clients/prisma';
import type { Prisma } from '../generated/prisma/client';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateConversationDto, ConversationWithPersonalityDto } from '../dtos/conversations.dto';
import { conversationWithPersonalityEntityToDto } from '../utils/entityToDtoMappers';
import { ErrorResponseDto, MessageResponseDto } from '../dtos/common.dto';

const conversationRelations = {
  personality: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
  scenario: {
    select: {
      id: true,
      situationDescriptionEn: true,
      situationDescriptionCs: true,
    },
  },
} satisfies Prisma.ConversationInclude;

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/conversations')
export class ConversationsController {
  @Get()
  @ApiOkResponse({ description: 'List conversations for current user', type: [ConversationWithPersonalityDto] })
  async getConversations(
    @Req() req: Request,
    @Res() res: Response<ConversationWithPersonalityDto[] | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId: req.user!.userId },
        include: conversationRelations,
        orderBy: { startTime: 'desc' },
      });

      res.status(200).json(conversations.map(conversationWithPersonalityEntityToDto));
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post()
  @ApiBody({ type: CreateConversationDto })
  @ApiOkResponse({ description: 'Created conversation', type: ConversationWithPersonalityDto })
  async createConversation(
    @Body() body: CreateConversationDto,
    @Req() req: Request,
    @Res() res: Response<ConversationWithPersonalityDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const { personalityId, scenarioId, startTime, endTime, endedReason, messages, logs, conversationType } = body;
      const messagePayload = messages?.map(({ role, content, timestamp }) => ({
        role,
        content,
        timestamp,
      }));
      const logPayload = logs?.map(({ timestamp, level, message, data }) => ({
        timestamp,
        level,
        message,
        ...(data != null ? { data } : {}),
      }));

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!startTime || !conversationType) {
        res.status(400).json({ message: 'personalityId, startTime, and conversationType are required' });
        return;
      }

      const conversation = await prisma.conversation.create({
        data: {
          userId: req.user!.userId,
          personalityId,
          scenarioId,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : undefined,
          endedReason: endedReason ?? undefined,
          messages: messagePayload,
          logs: logPayload,
          conversationType,
        },
        include: conversationRelations,
      });

      res.status(201).json(conversationWithPersonalityEntityToDto(conversation));
    } catch (error) {
      console.error('Create conversation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Conversation deleted', type: MessageResponseDto })
  async deleteConversation(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: parseInt(id) },
      });

      if (!conversation) {
        res.status(404).json({ message: 'Conversation not found' });
        return;
      }

      if (
        conversation.userId !== req.user!.userId &&
        req.user.userRole !== 'admin' &&
        req.user.userRole !== 'owner'
      ) {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      await prisma.conversation.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ description: 'List conversations for specific user', type: [ConversationWithPersonalityDto] })
  async getUserConversations(
    @Param('userId') userId: string,
    @Res() res: Response<ConversationWithPersonalityDto[] | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        include: conversationRelations,
        orderBy: { startTime: 'desc' },
      });

      res.status(200).json(conversations.map(conversationWithPersonalityEntityToDto));
    } catch (error) {
      console.error('Get user conversations error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
