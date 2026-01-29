import { Controller, Delete, Get, Param, Post, Put, Body, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import prisma from '../clients/prisma';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { ErrorResponse, MessageResponse } from '@repo/shared/types/dbRoutes.types';
import type { ScenarioWithPersonalityDto } from '@repo/shared/types/db/dto';
import { scenarioWithPersonalityToDto } from '@repo/shared/mappers/dtoMappers';
import { CreateScenarioDto, UpdateScenarioDto } from '../dtos/scenarios.dto';

@ApiTags('scenarios')
@Controller('api/scenarios')
export class ScenariosController {
    @Get()
    @ApiOkResponse({ description: 'List all scenarios', type: Object })
  async getScenarios(
        @Res() res: Response<ScenarioWithPersonalityDto[] | ErrorResponse>,
  ): Promise<void> {
    try {
      const scenarios = await prisma.scenario.findMany({
        include: {
          personality: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(scenarios.map(scenarioWithPersonalityToDto));
    } catch (error) {
      console.error('Get scenarios error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

    @Post()
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiBody({ type: CreateScenarioDto })
    @ApiOkResponse({ description: 'Created scenario', type: Object })
    async createScenario(
        @Body() body: CreateScenarioDto,
        @Res() res: Response<ScenarioWithPersonalityDto | ErrorResponse>,
    ): Promise<void> {
      try {
        const { involvedPersonalityId, situationDescriptionEn, settingEn, situationDescriptionCs, settingCs } = body;

        if (!involvedPersonalityId) {
          res.status(400).json({ message: 'involvedPersonalityId is required' });
          return;
        }

        const personality = await prisma.personality.findUnique({
          where: { id: involvedPersonalityId },
        });

        if (!personality) {
          res.status(404).json({ message: 'Personality not found' });
          return;
        }

        const scenario = await prisma.scenario.create({
          data: {
            involvedPersonalityId,
            situationDescriptionEn,
            settingEn,
            situationDescriptionCs,
            settingCs,
          },
          include: {
            personality: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        res.status(201).json(scenarioWithPersonalityToDto(scenario));
      } catch (error) {
        console.error('Create scenario error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiParam({ name: 'id', type: String })
    @ApiBody({ type: UpdateScenarioDto })
    @ApiOkResponse({ description: 'Updated scenario', type: Object })
    async updateScenario(
        @Param('id') id: string,
        @Body() body: UpdateScenarioDto,
        @Res() res: Response<ScenarioWithPersonalityDto | ErrorResponse>,
    ): Promise<void> {
      try {
        const { involvedPersonalityId, situationDescriptionEn, settingEn, situationDescriptionCs, settingCs } = body;

        if (involvedPersonalityId) {
          const personality = await prisma.personality.findUnique({
            where: { id: involvedPersonalityId },
          });

          if (!personality) {
            res.status(404).json({ message: 'Personality not found' });
            return;
          }
        }

        const scenario = await prisma.scenario.update({
          where: { id: parseInt(id) },
          data: {
            involvedPersonalityId,
            situationDescriptionEn,
            settingEn,
            situationDescriptionCs,
            settingCs,
          },
          include: {
            personality: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        res.status(200).json(scenarioWithPersonalityToDto(scenario));
      } catch (error) {
        console.error('Update scenario error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'owner')
    @ApiParam({ name: 'id', type: String })
    @ApiOkResponse({ description: 'Scenario deleted', type: Object })
    async deleteScenario(
        @Param('id') id: string,
        @Res() res: Response<MessageResponse | ErrorResponse>,
    ): Promise<void> {
      try {
        await prisma.scenario.delete({
          where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'Scenario deleted successfully' });
      } catch (error) {
        console.error('Delete scenario error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
}
