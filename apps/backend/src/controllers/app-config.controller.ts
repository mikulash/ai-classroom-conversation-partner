import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AppConfigDto } from '../dtos/app-config.dto';
import { ModelSelectionIdsDto } from '../dtos/common.dto';
import { AppConfigService } from '../services/app-config.service';
import type { JWTPayload } from '../utils/auth';

@ApiTags('app-config')
@Controller('api/app-config')
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @Get()
  @ApiOkResponse({ description: 'Get app configuration', type: AppConfigDto })
  getAppConfig(): Promise<AppConfigDto> {
    return this.appConfigService.getAppConfig();
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('owner')
  @ApiBody({ type: ModelSelectionIdsDto })
  @ApiOkResponse({ description: 'Update app configuration', type: AppConfigDto })
  updateAppConfig(
    @Body() body: ModelSelectionIdsDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<AppConfigDto> {
    return this.appConfigService.updateAppConfig(body, user);
  }
}
