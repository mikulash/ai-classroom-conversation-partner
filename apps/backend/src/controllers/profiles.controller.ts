import { Body, Controller, Get, Param, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import prisma from '../clients/prisma';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ErrorResponse } from '@repo/shared/types/dbRoutes.types';
import { profileToDto } from '@repo/shared/mappers/dtoMappers';
import { UpdateProfileDto, UpdateUserRoleDto, ProfileResponseDto } from '../dtos/profiles.dto';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api/profiles')
export class ProfilesController {
  @Get()
  @UseGuards(RolesGuard)
  @Roles('owner')
  @ApiOkResponse({ description: 'List profiles', type: [ProfileResponseDto] })
  async getProfiles(
    @Res() res: Response<ProfileResponseDto[] | ErrorResponse>,
  ): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        include: {
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const profiles = users
        .filter((user) => user.profile !== null)
        .map((user) => profileToDto({
          ...user.profile!,
          email: user.email,
          confirmedAt: user.confirmedAt,
        }));

      res.status(200).json(profiles);
    } catch (error) {
      console.error('Get profiles error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Updated profile', type: ProfileResponseDto })
  async updateProfile(
    @Param('id') id: string,
    @Body() body: UpdateProfileDto,
    @Req() req: Request,
    @Res() res: Response<ProfileResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const { fullName, gender, conversationRole, bio } = body;

      if (req.user?.userId !== id && req.user?.userRole !== 'admin' && req.user?.userRole !== 'owner') {
        res.status(403).json({ message: 'Insufficient permissions' });
        return;
      }

      await prisma.profile.upsert({
        where: { id: id },
        update: {
          fullName: fullName ?? '',
          gender: gender ?? '',
          conversationRole,
          bio: bio ?? '',
        },
        create: {
          id: id,
          fullName: fullName ?? '',
          gender: gender ?? '',
          conversationRole: conversationRole ?? '',
          bio: bio ?? '',
        },
      });

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updatedProfile = profileToDto({
        ...user.profile,
        email: user.email,
        confirmedAt: user.confirmedAt,
      });

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  @UseGuards(RolesGuard)
  @Roles('owner')
  @Put(':id/role')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiOkResponse({ description: 'Update user role', type: ProfileResponseDto })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: UpdateUserRoleDto,
    @Res() res: Response<ProfileResponseDto | ErrorResponse>,
  ): Promise<void> {
    try {
      const { userRole } = body;

      const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });

      if (!user || !user.profile) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { profile: { update: { userRole } } },
        include: { profile: true },
      });

      if (!updatedUser.profile) {
        res.status(500).json({ message: 'Failed to update user role' });
        return;
      }

      const updatedProfile = profileToDto({
        ...updatedUser.profile,
        email: updatedUser.email,
        confirmedAt: updatedUser.confirmedAt,
      });

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
