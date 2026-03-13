import { Controller, Delete, Get, Param, Post, Put, Body, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import prisma from '../clients/prisma';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePersonalityDto, UpdatePersonalityDto, PersonalityDto, MessageResponseDto } from '../dtos/personalities.dto';
import { personalityEntityToDto } from '../utils/entityToDtoMappers';
import { ErrorResponseDto } from '../dtos/common.dto';

@ApiTags('personalities')
@Controller('api/personalities')
export class PersonalitiesController {
  @Get()
  @ApiOkResponse({ description: 'List all personalities', type: [PersonalityDto] })
  async getPersonalities(
    @Res() res: Response<PersonalityDto[] | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const personalities = await prisma.personality.findMany({
        where: { isHidden: false },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(personalities.map(personalityEntityToDto));
    } catch (error) {
      console.error('Get personalities error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiBody({ type: CreatePersonalityDto })
  @ApiOkResponse({ description: 'Created personality', type: PersonalityDto })
  async createPersonality(
    @Body() body: CreatePersonalityDto,
    @Res() res: Response<PersonalityDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const {
        name,
        age,
        avatarUrl,
        gender,
        sex,
        voiceInstructions,
        elevenlabsVoiceId,
        openaiVoiceName,
        problemSummaryEn,
        personalityDescriptionEn,
        problemSummaryCs,
        personalityDescriptionCs,
        isHidden,
      } = body;

      if (!name) {
        res.status(400).json({ message: 'Name is required' });
        return;
      }

      const personality = await prisma.personality.create({
        data: {
          name,
          age,
          avatarUrl,
          gender,
          sex: sex as never,
          voiceInstructions,
          elevenlabsVoiceId,
          openaiVoiceName: openaiVoiceName as never,
          problemSummaryEn,
          personalityDescriptionEn,
          problemSummaryCs,
          personalityDescriptionCs,
          isHidden: isHidden ?? false,
        },
      });

      res.status(201).json(personalityEntityToDto(personality));
    } catch (error) {
      console.error('Create personality error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePersonalityDto })
  @ApiOkResponse({ description: 'Updated personality', type: PersonalityDto })
  async updatePersonality(
    @Param('id') id: string,
    @Body() body: UpdatePersonalityDto,
    @Res() res: Response<PersonalityDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      const {
        name,
        age,
        avatarUrl,
        gender,
        sex,
        voiceInstructions,
        elevenlabsVoiceId,
        openaiVoiceName,
        problemSummaryEn,
        personalityDescriptionEn,
        problemSummaryCs,
        personalityDescriptionCs,
        isHidden,
      } = body;

      const personality = await prisma.personality.update({
        where: { id: parseInt(id) },
        data: {
          name,
          age,
          avatarUrl,
          gender,
          sex: sex as never,
          voiceInstructions,
          elevenlabsVoiceId,
          openaiVoiceName: openaiVoiceName as never,
          problemSummaryEn,
          personalityDescriptionEn,
          problemSummaryCs,
          personalityDescriptionCs,
          isHidden,
        },
      });

      res.status(200).json(personalityEntityToDto(personality));
    } catch (error) {
      console.error('Update personality error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Personality deleted', type: MessageResponseDto })
  async deletePersonality(
    @Param('id') id: string,
    @Res() res: Response<MessageResponseDto | ErrorResponseDto>,
  ): Promise<void> {
    try {
      await prisma.personality.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Personality deleted successfully' });
    } catch (error) {
      console.error('Delete personality error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
