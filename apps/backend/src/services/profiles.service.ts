import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { ProfileDto, UpdateProfileDto, UpdateUserRoleDto } from '../dtos/profiles.dto';
import { profileEntityToDto } from '../utils/entityToDtoMappers';
import { JWTPayload } from '../utils/auth';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfiles(): Promise<ProfileDto[]> {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    return users
      .filter((user) => user.profile !== null)
      .map((user) => profileEntityToDto({
        ...user.profile!,
        email: user.email,
        confirmedAt: user.confirmedAt,
      }));
  }

  async updateProfile(id: string, body: UpdateProfileDto, currentUser: JWTPayload): Promise<ProfileDto> {
    if (currentUser.userId !== id && currentUser.userRole !== 'admin' && currentUser.userRole !== 'owner') {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.prisma.profile.upsert({
      where: { id },
      update: {
        fullName: body.fullName ?? '',
        gender: body.gender ?? '',
        conversationRole: body.conversationRole,
        bio: body.bio ?? '',
      },
      create: {
        id,
        fullName: body.fullName ?? '',
        gender: body.gender ?? '',
        conversationRole: body.conversationRole ?? '',
        bio: body.bio ?? '',
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('User not found');
    }

    return profileEntityToDto({
      ...user.profile,
      email: user.email,
      confirmedAt: user.confirmedAt,
    });
  }

  async updateUserRole(id: string, body: UpdateUserRoleDto): Promise<ProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { profile: true } });

    if (!user?.profile) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { profile: { update: { userRole: body.userRole } } },
      include: { profile: true },
    });

    if (!updatedUser.profile) {
      throw new NotFoundException('User not found');
    }

    return profileEntityToDto({
      ...updatedUser.profile,
      email: updatedUser.email,
      confirmedAt: updatedUser.confirmedAt,
    });
  }
}
