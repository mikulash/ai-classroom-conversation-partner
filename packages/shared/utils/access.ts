import { Profile } from '../types/supabase/supabaseTypeHelpers';

export const isProfileAdmin = (profile: Profile) => {
  return profile.user_role === 'admin' || profile.user_role === 'owner';
};

export const isProfileOwner = (profile: Profile) => {
  return profile.user_role === 'owner';
};
