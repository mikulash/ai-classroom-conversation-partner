import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { StringValue } from 'ms';
import prisma from '../clients/prisma';
import { getJwtSecret, JWT_EXPIRES_IN } from '../constants/constants';

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const BCRYPT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
  userRole: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as StringValue };
  return jwt.sign(payload, getJwtSecret(), options);
}

/**
 * Verify and decode a JWT token
 */
export function verifyAndDecodeToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header (Bearer token)
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7); // Remove 'Bearer ' prefix
}

/**
 * Generate a cryptographically secure refresh token
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Store a refresh token in the database
 */
export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}

/**
 * Verify a refresh token and return the associated user ID
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) {
    return null;
  }

  // Check if token is revoked
  if (refreshToken.revoked) {
    return null;
  }

  // Check if token is expired
  if (refreshToken.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({
      where: { id: refreshToken.id },
    });
    return null;
  }

  return refreshToken.userId;
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
}
