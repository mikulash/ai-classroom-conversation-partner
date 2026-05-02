import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePersonalityDto, UpdatePersonalityDto, PersonalityDto } from '../dtos/personalities.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { CatalogService } from '../services/catalog.service';

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
