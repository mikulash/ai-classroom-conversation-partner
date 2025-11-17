import { ProfileResponse } from '@repo/shared/types/dbRoutes.types';
import { Profile, User } from '../../generated/prisma/client';

type UserWithProfile = User & { profile: Profile | null};

export function mapUserToProfileResponse(user: UserWithProfile): ProfileResponse {
  // if profile is missing, synthesize it from user
  return {
    id: user.id, // you can also keep profile.id if you want; but for API it's nice to have stable id
    createdAt: user.profile?.createdAt ?? user.createdAt,
    updatedAt: user.profile?.updatedAt ?? user.updatedAt,
    fullName: user.profile?.fullName ?? '',
    gender: user.profile?.gender ?? '',
    conversationRole: user.profile?.conversationRole ?? '',
    bio: user.profile?.bio ?? '',
    email: user.email,
    userRole: user.profile?.userRole ?? 'basic',
    confirmedAt: user.confirmedAt ?? null,
  };
}
