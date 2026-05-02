import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateConversationDto, ConversationWithPersonalityDto } from '../dtos/conversations.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { conversationWithPersonalityEntityToDto } from '../utils/entityToDtoMappers';
import { JWTPayload } from '../utils/auth';

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

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(currentUser: JWTPayload): Promise<ConversationWithPersonalityDto[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { userId: currentUser.userId },
      include: conversationRelations,
      orderBy: { startTime: 'desc' },
    });

    return conversations.map(conversationWithPersonalityEntityToDto);
  }

  async createConversation(
    body: CreateConversationDto,
    currentUser: JWTPayload,
  ): Promise<ConversationWithPersonalityDto> {
    const messagePayload = body.messages?.map(({ role, content, timestamp }) => ({
      role,
      content,
      timestamp,
    }));
    const logPayload = body.logs?.map(({ timestamp, level, message, data }) => ({
      timestamp,
      level,
      message,
      ...(data != null ? { data } : {}),
    }));

    const conversation = await this.prisma.conversation.create({
      data: {
        userId: currentUser.userId,
        personalityId: body.personalityId,
        scenarioId: body.scenarioId,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        endedReason: body.endedReason ?? undefined,
        messages: messagePayload,
        logs: logPayload,
        conversationType: body.conversationType,
      },
      include: conversationRelations,
    });

    return conversationWithPersonalityEntityToDto(conversation);
  }

  async deleteConversation(id: number, currentUser: JWTPayload): Promise<MessageResponseDto> {
    const conversation = await this.prisma.conversation.findUnique({ where: { id } });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.userId !== currentUser.userId &&
      currentUser.userRole !== 'admin' &&
      currentUser.userRole !== 'owner'
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.conversation.delete({ where: { id } });
    return { message: 'Conversation deleted successfully' };
  }

  async getUserConversations(userId: string): Promise<ConversationWithPersonalityDto[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { userId },
      include: conversationRelations,
      orderBy: { startTime: 'desc' },
    });

    return conversations.map(conversationWithPersonalityEntityToDto);
  }
}
