import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { EnvConfigService } from '../core/config/env-config.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { TokenService } from './token.service';

interface StoredRefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  revoked: boolean;
}

interface StoredPasswordResetToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

interface RefreshTokenWhere {
  id?: string;
  token?: string;
  userId?: string;
  revoked?: boolean;
}

class PrismaMock {
  readonly refreshTokens: StoredRefreshToken[] = [];
  readonly passwordResetTokens: StoredPasswordResetToken[] = [];
  private nextId = 0;

  readonly refreshToken = {
    create: async (args: {
      data: { token: string; userId: string; expiresAt: Date; revoked?: boolean };
    }): Promise<StoredRefreshToken> => {
      const record = {
        id: this.id('refresh'),
        token: args.data.token,
        userId: args.data.userId,
        expiresAt: args.data.expiresAt,
        revoked: args.data.revoked ?? false,
      };
      this.refreshTokens.push(record);
      return record;
    },
    findUnique: async (args: { where: { id?: string; token?: string } }): Promise<StoredRefreshToken | null> => (
      this.refreshTokens.find((record) => this.matchesRefreshWhere(record, args.where)) ?? null
    ),
    update: async (args: {
      where: { id: string };
      data: Partial<Pick<StoredRefreshToken, 'revoked'>>;
    }): Promise<StoredRefreshToken> => {
      const record = this.refreshTokens.find((item) => item.id === args.where.id);
      assert.ok(record);
      if (args.data.revoked !== undefined) {
        record.revoked = args.data.revoked;
      }
      return record;
    },
    updateMany: async (args: {
      where: RefreshTokenWhere;
      data: Partial<Pick<StoredRefreshToken, 'revoked'>>;
    }): Promise<{ count: number }> => {
      const records = this.refreshTokens.filter((record) => this.matchesRefreshWhere(record, args.where));
      for (const record of records) {
        if (args.data.revoked !== undefined) {
          record.revoked = args.data.revoked;
        }
      }
      return { count: records.length };
    },
    delete: async (args: { where: { id: string } }): Promise<StoredRefreshToken> => {
      const index = this.refreshTokens.findIndex((record) => record.id === args.where.id);
      assert.notEqual(index, -1);
      const [record] = this.refreshTokens.splice(index, 1);
      assert.ok(record);
      return record;
    },
  };

  readonly passwordResetToken = {
    create: async (args: {
      data: { token: string; userId: string; expiresAt: Date };
    }): Promise<StoredPasswordResetToken> => {
      const record = {
        id: this.id('reset'),
        token: args.data.token,
        userId: args.data.userId,
        expiresAt: args.data.expiresAt,
        usedAt: null,
      };
      this.passwordResetTokens.push(record);
      return record;
    },
    findUnique: async (args: { where: { token: string } }): Promise<StoredPasswordResetToken | null> => (
      this.passwordResetTokens.find((record) => record.token === args.where.token) ?? null
    ),
    update: async (args: {
      where: { id: string };
      data: Partial<Pick<StoredPasswordResetToken, 'usedAt'>>;
    }): Promise<StoredPasswordResetToken> => {
      const record = this.passwordResetTokens.find((item) => item.id === args.where.id);
      assert.ok(record);
      if (args.data.usedAt !== undefined) {
        record.usedAt = args.data.usedAt;
      }
      return record;
    },
  };

  async $transaction<T>(operations: Promise<T>[]): Promise<T[]> {
    return Promise.all(operations);
  }

  private id(prefix: string): string {
    this.nextId += 1;
    return `${prefix}-${this.nextId}`;
  }

  private matchesRefreshWhere(record: StoredRefreshToken, where: RefreshTokenWhere): boolean {
    return (
      (where.id === undefined || record.id === where.id) &&
      (where.token === undefined || record.token === where.token) &&
      (where.userId === undefined || record.userId === where.userId) &&
      (where.revoked === undefined || record.revoked === where.revoked)
    );
  }
}

function createTokenService(prisma = new PrismaMock()): { service: TokenService; prisma: PrismaMock } {
  const config = {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '15m',
  } as unknown as EnvConfigService;

  return {
    service: new TokenService(prisma as unknown as PrismaService, config),
    prisma,
  };
}

describe('TokenService', () => {
  it('rotates refresh tokens and rejects reuse', async () => {
    const { service, prisma } = createTokenService();

    const originalToken = await service.createRefreshToken('user-1');
    const rotated = await service.rotateRefreshToken(originalToken);

    assert.ok(rotated);
    assert.equal(rotated.userId, 'user-1');
    assert.notEqual(rotated.refreshToken, originalToken);

    const originalRecord = prisma.refreshTokens[0];
    assert.ok(originalRecord);
    assert.equal(originalRecord.revoked, true);

    assert.equal(await service.rotateRefreshToken(originalToken), null);
    assert.ok(await service.rotateRefreshToken(rotated.refreshToken));
  });

  it('consumes password reset tokens once', async () => {
    const { service } = createTokenService();

    const token = await service.createPasswordResetToken('user-1');

    assert.equal(await service.consumePasswordResetToken(token), 'user-1');
    assert.equal(await service.consumePasswordResetToken(token), null);
  });

  it('rejects expired password reset tokens', async () => {
    const { service, prisma } = createTokenService();

    const token = await service.createPasswordResetToken('user-1');
    const record = prisma.passwordResetTokens[0];
    assert.ok(record);
    record.expiresAt = new Date(Date.now() - 1);

    assert.equal(await service.consumePasswordResetToken(token), null);
  });
});
