import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { ConversationRoleDto } from '../dtos/conversation-roles.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { CreatePersonalityDto, PersonalityDto, UpdatePersonalityDto } from '../dtos/personalities.dto';
import { CreateScenarioDto, ScenarioWithPersonalityDto, UpdateScenarioDto } from '../dtos/scenarios.dto';
import {
  conversationRoleEntityToDto,
  personalityEntityToDto,
  scenarioWithPersonalityEntityToDto,
} from '../utils/entityToDtoMappers';

const scenarioPersonalityInclude = {
  personality: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
} as const;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getPersonalities(): Promise<PersonalityDto[]> {
    const personalities = await this.prisma.personality.findMany({
      where: { isHidden: false },
      orderBy: { createdAt: 'desc' },
    });

    return personalities.map(personalityEntityToDto);
  }

  async createPersonality(body: CreatePersonalityDto): Promise<PersonalityDto> {
    if (!body.name) {
      throw new BadRequestException('Name is required');
    }

    const personality = await this.prisma.personality.create({
      data: {
        name: body.name,
        age: body.age,
        avatarUrl: body.avatarUrl,
        gender: body.gender,
        sex: body.sex,
        voiceInstructions: body.voiceInstructions,
        elevenlabsVoiceId: body.elevenlabsVoiceId,
        openaiVoiceName: body.openaiVoiceName,
        problemSummaryEn: body.problemSummaryEn,
        personalityDescriptionEn: body.personalityDescriptionEn,
        problemSummaryCs: body.problemSummaryCs,
        personalityDescriptionCs: body.personalityDescriptionCs,
        isHidden: body.isHidden ?? false,
      },
    });

    return personalityEntityToDto(personality);
  }

  async updatePersonality(id: number, body: UpdatePersonalityDto): Promise<PersonalityDto> {
    const personality = await this.prisma.personality.update({
      where: { id },
      data: body,
    });

    return personalityEntityToDto(personality);
  }

  async deletePersonality(id: number): Promise<MessageResponseDto> {
    await this.prisma.personality.delete({ where: { id } });
    return { message: 'Personality deleted successfully' };
  }

  async getScenarios(): Promise<ScenarioWithPersonalityDto[]> {
    const scenarios = await this.prisma.scenario.findMany({
      include: scenarioPersonalityInclude,
      orderBy: { createdAt: 'desc' },
    });

    return scenarios.map(scenarioWithPersonalityEntityToDto);
  }

  async createScenario(body: CreateScenarioDto): Promise<ScenarioWithPersonalityDto> {
    if (body.involvedPersonalityId == null) {
      throw new BadRequestException('involvedPersonalityId is required');
    }

    await this.ensurePersonalityExists(body.involvedPersonalityId);

    const scenario = await this.prisma.scenario.create({
      data: {
        involvedPersonalityId: body.involvedPersonalityId,
        situationDescriptionEn: body.situationDescriptionEn,
        settingEn: body.settingEn,
        situationDescriptionCs: body.situationDescriptionCs,
        settingCs: body.settingCs,
      },
      include: scenarioPersonalityInclude,
    });

    return scenarioWithPersonalityEntityToDto(scenario);
  }

  async updateScenario(id: number, body: UpdateScenarioDto): Promise<ScenarioWithPersonalityDto> {
    if (body.involvedPersonalityId != null) {
      await this.ensurePersonalityExists(body.involvedPersonalityId);
    }

    const scenario = await this.prisma.scenario.update({
      where: { id },
      data: body,
      include: scenarioPersonalityInclude,
    });

    return scenarioWithPersonalityEntityToDto(scenario);
  }

  async deleteScenario(id: number): Promise<MessageResponseDto> {
    await this.prisma.scenario.delete({ where: { id } });
    return { message: 'Scenario deleted successfully' };
  }

  async getConversationRoles(): Promise<ConversationRoleDto[]> {
    const roles = await this.prisma.conversationRole.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return roles.map(conversationRoleEntityToDto);
  }

  private async ensurePersonalityExists(id: number): Promise<void> {
    const personality = await this.prisma.personality.findUnique({ where: { id } });
    if (!personality) {
      throw new NotFoundException('Personality not found');
    }
  }
}
