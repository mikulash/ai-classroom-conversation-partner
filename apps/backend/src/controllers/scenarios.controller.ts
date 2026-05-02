import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateScenarioDto, UpdateScenarioDto, ScenarioWithPersonalityDto } from '../dtos/scenarios.dto';
import { MessageResponseDto } from '../dtos/common.dto';
import { CatalogService } from '../services/catalog.service';

@ApiTags('scenarios')
@Controller('api/scenarios')
export class ScenariosController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOkResponse({ description: 'List all scenarios', type: [ScenarioWithPersonalityDto] })
  getScenarios(): Promise<ScenarioWithPersonalityDto[]> {
    return this.catalogService.getScenarios();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiBody({ type: CreateScenarioDto })
  @ApiOkResponse({ description: 'Created scenario', type: ScenarioWithPersonalityDto })
  createScenario(@Body() body: CreateScenarioDto): Promise<ScenarioWithPersonalityDto> {
    return this.catalogService.createScenario(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateScenarioDto })
  @ApiOkResponse({ description: 'Updated scenario', type: ScenarioWithPersonalityDto })
  updateScenario(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateScenarioDto,
  ): Promise<ScenarioWithPersonalityDto> {
    return this.catalogService.updateScenario(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'owner')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({ description: 'Scenario deleted', type: MessageResponseDto })
  deleteScenario(@Param('id', ParseIntPipe) id: number): Promise<MessageResponseDto> {
    return this.catalogService.deleteScenario(id);
  }
}
