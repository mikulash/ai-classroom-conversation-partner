export const isProfileAdmin = (profile: { userRole: string }) => {
  return profile.userRole === 'admin' || profile.userRole === 'owner';
};

export const isProfileOwner = (profile: { userRole: string }) => {
  return profile.userRole === 'owner';
};
