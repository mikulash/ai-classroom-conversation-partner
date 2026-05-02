import { Body, Controller, Get, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto, UpdateUserRoleDto, ProfileDto } from '../dtos/profiles.dto';
import { ProfilesService } from '../services/profiles.service';
import type { JWTPayload } from '../utils/auth';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('owner')
  @ApiOkResponse({ description: 'List profiles', type: [ProfileDto] })
  getProfiles(): Promise<ProfileDto[]> {
    return this.profilesService.getProfiles();
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Updated profile', type: ProfileDto })
  updateProfile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProfileDto,
    @CurrentUser() user: JWTPayload,
  ): Promise<ProfileDto> {
    return this.profilesService.updateProfile(id, body, user);
  }

  @UseGuards(RolesGuard)
  @Roles('owner')
  @Put(':id/role')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOkResponse({ description: 'Update user role', type: ProfileDto })
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRoleDto,
  ): Promise<ProfileDto> {
    return this.profilesService.updateUserRole(id, body);
  }
}
