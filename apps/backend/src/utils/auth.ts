import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { StringValue } from 'ms';
import prisma from '../clients/prisma';
import { getJwtSecret, JWT_EXPIRES_IN } from '../constants/constants';

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const BCRYPT_ROUNDS = 10; // For password hashing only
const TOKEN_HASH_ALGORITHM = 'sha256'; // For refresh token hashing

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
export function hashRefreshToken(token: string): string {
    return crypto.createHash(TOKEN_HASH_ALGORITHM).update(token).digest('hex');
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
 * Store a refresh token in the database (hashed for security)
 */
export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  // Hash the token before storing to protect against database leaks
  const hashedToken = hashRefreshToken(token);

  await prisma.refreshToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });
}

/**
 * Verify a refresh token and return the associated user ID
 * Note: Since tokens are hashed, we must compare against all active tokens
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
    const hashedToken = hashRefreshToken(token);

    const refreshToken = await prisma.refreshToken.findUnique({
        where: { token: hashedToken },
    });

    if (!refreshToken) {
        return null;
    }

    if (refreshToken.revoked) {
        return null;
    }

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
 * Note: Since tokens are hashed, we must compare against all active tokens
 */
export async function revokeRefreshToken(token: string): Promise<void> {
    const hashedToken = hashRefreshToken(token);
    await prisma.refreshToken.updateMany({
        where: { token: hashedToken },
        data: { revoked: true },
    });
}

/**
 * Generate a cryptographically secure password reset token
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a password reset token for storage
 */
function hashPasswordResetToken(token: string): string {
  return crypto.createHash(TOKEN_HASH_ALGORITHM).update(token).digest('hex');
}

/**
 * Store a password reset token in the database
 */
export async function storePasswordResetToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  const hashedToken = hashPasswordResetToken(token);

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      used: false,
    },
    data: { used: true },
  });

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt,
    },
  });
}

/**
 * Verify and consume a password reset token
 * Returns userId if valid, null otherwise
 * Marks token as used to prevent reuse
 */
export async function verifyAndConsumePasswordResetToken(token: string): Promise<string | null> {
  const hashedToken = hashPasswordResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!resetToken) {
    return null;
  }

  // Check if token was already used
  if (resetToken.used) {
    return null;
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    return null;
  }

  // Mark token as used (one-time use only)
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  });

  return resetToken.userId;
}
