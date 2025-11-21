import { Request } from 'express';
import { extractTokenFromHeader, verifyAndDecodeToken } from './auth';

/**
 * Extracts the user ID from a request's Bearer token using JWT authentication.
 * Throws an error if the token is missing, invalid, or expired.
 *
 * @param {Request} req - The Express request object containing the authorization header.
 * @returns {string} The authenticated user's ID.
 * @throws {Error} If the bearer token is missing, invalid, or expired.
 */
export function getUserId(req: Request): string {
  const token = extractTokenFromHeader(req.header('authorization'));

  if (!token) {
    throw new Error('Missing bearer token');
  }

  try {
    const decoded = verifyAndDecodeToken(token);
    return decoded.userId;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
}
