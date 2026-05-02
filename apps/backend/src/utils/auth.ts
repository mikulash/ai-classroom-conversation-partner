export interface JWTPayload {
  userId: string;
  email: string;
  userRole: string;
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
