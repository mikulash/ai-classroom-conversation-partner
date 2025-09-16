export const isValidUniversityEmail = (email: string, allowedDomains: string[]): boolean => {
  if (allowedDomains.length === 0) return true;

  const emailParts = email.split('@');
  if (emailParts.length !== 2) return false; // Invalid email format
  const domain = emailParts[1].toLowerCase();
  return allowedDomains.some((allowedDomain) => domain.endsWith(allowedDomain));
};
