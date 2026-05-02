import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateConversationDto, ConversationWithPersonalityDto } from '../dtos/conversations.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { ConversationsService } from '../services/conversations.service';
import type { JWTPayload } from '../utils/auth';

@ApiTags('conversations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @ApiOkResponse({ description: 'List conversations for current user', type: [ConversationWithPersonalityDto] })
  getConversations(@CurrentUser() user: JWTPayload): Promise<ConversationWithPersonalityDto[]> {
    return this.conversationsService.getConversations(user);
  }

  @Post()
  @ApiBody({ type: CreateConversationDto })
  @ApiOkResponse({ description: 'Created conversation', type: ConversationWithPersonalityDto })
  createConversation(
    @Body() body: CreateConversationDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<ConversationWithPersonalityDto> {
    return this.conversationsService.createConversation(body, user);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Conversation deleted', type: MessageResponseDto })
  deleteConversation(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JWTPayload,
  ): Promise<MessageResponseDto> {
    return this.conversationsService.deleteConversation(id, user);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ description: 'List conversations for specific user', type: [ConversationWithPersonalityDto] })
  getUserConversations(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ConversationWithPersonalityDto[]> {
    return this.conversationsService.getUserConversations(userId);
  }
}
