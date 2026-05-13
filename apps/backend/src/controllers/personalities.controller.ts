import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AvatarUploadDto, CreatePersonalityDto, UpdatePersonalityDto, PersonalityDto } from '../dtos/personalities.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { CatalogService } from '../services/catalog.service';
import { AvatarStorageService } from '../services/avatar-storage.service';
import type { UploadedAvatarFile } from '../services/avatar-storage.service';

const maxAvatarFileSize = 50 * 1024 * 1024;

@ApiTags('personalities')
@Controller('api/personalities')
export class PersonalitiesController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOkResponse({ description: 'List all personalities', type: [PersonalityDto] })
  getPersonalities(): Promise<PersonalityDto[]> {
    return this.catalogService.getPersonalities();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiBody({ type: CreatePersonalityDto })
  @ApiOkResponse({ description: 'Created personality', type: PersonalityDto })
  createPersonality(@Body() body: CreatePersonalityDto): Promise<PersonalityDto> {
    return this.catalogService.createPersonality(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePersonalityDto })
  @ApiOkResponse({ description: 'Updated personality', type: PersonalityDto })
  updatePersonality(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePersonalityDto,
  ): Promise<PersonalityDto> {
    return this.catalogService.updatePersonality(id, body);
  }

  @Post(':id/avatar')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: maxAvatarFileSize } }))
  @ApiParam({ name: 'id', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOkResponse({ description: 'Updated personality avatar', type: PersonalityDto })
  uploadPersonalityAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() avatar: UploadedAvatarFile,
  ): Promise<PersonalityDto> {
    return this.catalogService.uploadPersonalityAvatar(id, avatar);
  }

  @Delete(':id/avatar')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Removed personality avatar', type: PersonalityDto })
  removePersonalityAvatar(@Param('id', ParseIntPipe) id: number): Promise<PersonalityDto> {
    return this.catalogService.removePersonalityAvatar(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Personality deleted', type: MessageResponseDto })
  deletePersonality(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDto> {
    return this.catalogService.deletePersonality(id);
  }
}

@ApiTags('personality-avatars')
@Controller('api/personality-avatars')
export class PersonalityAvatarsController {
  constructor(private readonly avatarStorage: AvatarStorageService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: maxAvatarFileSize } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['avatar'],
    },
  })
  @ApiOkResponse({ description: 'Uploaded avatar file', type: AvatarUploadDto })
  async uploadAvatar(@UploadedFile() avatar: UploadedAvatarFile): Promise<AvatarUploadDto> {
    return {
      avatarUrl: await this.avatarStorage.saveAvatar(avatar, 'pending'),
    };
  }

  @Get(':filename')
  async getPersonalityAvatar(
    @Param('filename') filename: string,
    @Res() response: Response,
  ): Promise<void> {
    const filePath = await this.avatarStorage.getAvatarFilePath(filename);
    response.type('model/gltf-binary');
    response.sendFile(filePath);
  }
}
