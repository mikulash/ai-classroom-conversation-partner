import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { PrismaService } from '../core/prisma/prisma.service';
import { EnvConfigService } from '../core/config/env-config.service';
import { JWTPayload } from '../utils/auth';

const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000;
const BCRYPT_ROUNDS = 10;
const TOKEN_HASH_ALGORITHM = 'sha256';

export interface EmailVerificationPayload {
  userId: string;
  email: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: EnvConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn as StringValue,
    });
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.config.jwtSecret) as JWTPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  generateEmailVerificationToken(userId: string, email: string): string {
    return jwt.sign({ userId, email }, this.config.jwtSecret, { expiresIn: '10m' });
  }

  verifyEmailVerificationToken(token: string): EmailVerificationPayload | null {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret);
      if (
        typeof payload !== 'string' &&
        typeof payload.userId === 'string' &&
        typeof payload.email === 'string'
      ) {
        return { userId: payload.userId, email: payload.email };
      }
      return null;
    } catch {
      return null;
    }
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    await this.prisma.refreshToken.create({
      data: {
        token: this.hashToken(token),
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
      },
    });
    return token;
  }

  async rotateRefreshToken(token: string): Promise<{ userId: string; refreshToken: string } | null> {
    const hashedToken = this.hashToken(token);
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!existingToken || existingToken.revoked) {
      return null;
    }

    if (existingToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: existingToken.id } });
      return null;
    }

    const refreshToken = crypto.randomBytes(64).toString('hex');
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: { revoked: true },
      }),
      this.prisma.refreshToken.create({
        data: {
          token: this.hashToken(refreshToken),
          userId: existingToken.userId,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS),
        },
      }),
    ]);

    return { userId: existingToken.userId, refreshToken };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: this.hashToken(token) },
      data: { revoked: true },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        token: this.hashToken(token),
        userId,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_IN_MS),
      },
    });
    return token;
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: this.hashToken(token) },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return null;
    }

    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    return resetToken.userId;
  }

  private hashToken(token: string): string {
    return crypto.createHash(TOKEN_HASH_ALGORITHM).update(token).digest('hex');
  }
}
