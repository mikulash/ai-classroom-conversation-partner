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
import { AvatarStorageService } from './avatar-storage.service';
import type { UploadedAvatarFile } from './avatar-storage.service';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatarStorage: AvatarStorageService,
  ) {}

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

    const { uploadedAvatarUrl, ...personalityData } = body;
    this.avatarStorage.requireManagedAvatarUrl(uploadedAvatarUrl);

    const personality = await this.prisma.personality.create({
      data: {
        ...personalityData,
        isHidden: personalityData.isHidden ?? false,
      },
    });

    if (!uploadedAvatarUrl) {
      return personalityEntityToDto(personality);
    }

    const avatarUrl = await this.avatarStorage.attachUploadedAvatar(uploadedAvatarUrl, personality.id);

    try {
      const personalityWithAvatar = await this.prisma.personality.update({
        where: { id: personality.id },
        data: { avatarUrl },
      });

      return personalityEntityToDto(personalityWithAvatar);
    } catch (error) {
      await this.avatarStorage.removeManagedAvatar(avatarUrl);
      throw error;
    }
  }

  async updatePersonality(id: number, body: UpdatePersonalityDto): Promise<PersonalityDto> {
    const existingPersonality = Object.hasOwn(body, 'uploadedAvatarUrl') ?
      await this.prisma.personality.findUnique({ where: { id } }) :
      null;
    const { uploadedAvatarUrl, ...personalityData } = body;
    const avatarUrl = existingPersonality ?
      await this.avatarStorage.attachUploadedAvatar(uploadedAvatarUrl, existingPersonality.id) :
      this.avatarStorage.requireManagedAvatarUrl(uploadedAvatarUrl);

    try {
      const personality = await this.prisma.personality.update({
        where: { id },
        data: {
          ...personalityData,
          ...(avatarUrl ? { avatarUrl } : {}),
        },
      });

      if (existingPersonality?.avatarUrl && avatarUrl && existingPersonality.avatarUrl !== avatarUrl) {
        await this.avatarStorage.removeManagedAvatar(existingPersonality.avatarUrl);
      }

      return personalityEntityToDto(personality);
    } catch (error) {
      if (avatarUrl && avatarUrl !== existingPersonality?.avatarUrl) {
        await this.avatarStorage.removeManagedAvatar(avatarUrl);
      }

      throw error;
    }
  }

  async uploadPersonalityAvatar(id: number, file: UploadedAvatarFile): Promise<PersonalityDto> {
    const existingPersonality = await this.prisma.personality.findUnique({ where: { id } });
    if (!existingPersonality) {
      throw new NotFoundException('Personality not found');
    }

    const avatarUrl = await this.avatarStorage.saveAvatar(file, id);

    try {
      const personality = await this.prisma.personality.update({
        where: { id },
        data: { avatarUrl },
      });

      await this.avatarStorage.removeManagedAvatar(existingPersonality.avatarUrl);
      return personalityEntityToDto(personality);
    } catch (error) {
      await this.avatarStorage.removeManagedAvatar(avatarUrl);
      throw error;
    }
  }

  async removePersonalityAvatar(id: number): Promise<PersonalityDto> {
    const existingPersonality = await this.prisma.personality.findUnique({ where: { id } });
    if (!existingPersonality) {
      throw new NotFoundException('Personality not found');
    }

    const personality = await this.prisma.personality.update({
      where: { id },
      data: { avatarUrl: null },
    });

    await this.avatarStorage.removeManagedAvatar(existingPersonality.avatarUrl);
    return personalityEntityToDto(personality);
  }

  async deletePersonality(id: number): Promise<MessageResponseDto> {
    const personality = await this.prisma.personality.delete({ where: { id } });
    await this.avatarStorage.removeManagedAvatar(personality.avatarUrl);
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
