import { Profile } from '../types/db/entities';


export const isProfileAdmin = (profile: Profile) => {
  return profile.userRole === 'admin' || profile.userRole === 'owner';
};

export const isProfileOwner = (profile: Profile) => {
  return profile.userRole === 'owner';
};

