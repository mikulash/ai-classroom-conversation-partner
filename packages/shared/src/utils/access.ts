import { ProfileResponse } from '../types/dbRoutes.types';

export const isProfileAdmin = (profile: ProfileResponse) => {
  return profile.userRole === 'admin' || profile.userRole === 'owner';
};

export const isProfileOwner = (profile: ProfileResponse) => {
  return profile.userRole === 'owner';
};

