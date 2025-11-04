import { Profile } from '../generated/prisma/client';


export const isProfileAdmin = (profile: Profile) => {
  return profile.userRole === 'admin' || profile.userRole === 'owner';
};

export const isProfileOwner = (profile: Profile) => {
  return profile.userRole === 'owner';
};

