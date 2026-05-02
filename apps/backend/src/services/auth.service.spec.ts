import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ForbiddenException } from '@nestjs/common';
import { EnvConfigService } from '../core/config/env-config.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { ConfigProvider } from '../utils/configProvider';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { TokenService } from './token.service';

const registrationMessage =
  'Registration request received. If this email can be registered, you will receive a verification link.';

function createAuthService(args: {
  prisma?: object;
  config?: object;
  configProvider?: object;
  tokenService?: object;
  mailService?: object;
}): AuthService {
  return new AuthService(
    (args.prisma ?? {}) as unknown as PrismaService,
    (args.config ?? { appFrontendUrl: 'https://app.example' }) as unknown as EnvConfigService,
    (args.configProvider ?? {}) as unknown as ConfigProvider,
    (args.tokenService ?? {}) as unknown as TokenService,
    (args.mailService ?? {}) as unknown as MailService,
  );
}

describe('AuthService', () => {
  it('returns the privacy-preserving registration response for duplicate emails', async () => {
    let hashCalled = false;
    let mailCalled = false;
    const service = createAuthService({
      prisma: {
        user: {
          findUnique: async (): Promise<object> => ({ id: 'existing-user' }),
        },
      },
      configProvider: {
        getAppConfig: async (): Promise<{ allowedDomains: string[] }> => ({ allowedDomains: [] }),
      },
      tokenService: {
        hashPassword: async (): Promise<string> => {
          hashCalled = true;
          return 'hashed-password';
        },
      },
      mailService: {
        sendVerificationEmail: async (): Promise<void> => {
          mailCalled = true;
        },
      },
    });

    const response = await service.register({
      email: 'student@example.edu',
      password: 'Password1',
      fullName: 'Ada Lovelace',
      gender: 'female',
    });

    assert.equal(response.message, registrationMessage);
    assert.equal(hashCalled, false);
    assert.equal(mailCalled, false);
  });

  it('sends password reset links to the frontend reset route', async () => {
    let sentUrl = '';
    const service = createAuthService({
      prisma: {
        user: {
          findUnique: async (): Promise<{ id: string; email: string }> => ({
            id: 'user-1',
            email: 'student@example.edu',
          }),
        },
      },
      tokenService: {
        createPasswordResetToken: async (): Promise<string> => 'raw/token?value',
      },
      mailService: {
        sendPasswordResetEmail: async (_email: string, url: string): Promise<void> => {
          sentUrl = url;
        },
      },
    });

    const response = await service.requestPasswordReset({ email: 'student@example.edu' });

    assert.equal(
      response.message,
      'If an account exists with this email, you will receive password reset instructions.',
    );
    assert.equal(sentUrl, 'https://app.example/reset-password?token=raw%2Ftoken%3Fvalue');
  });

  it('blocks login for valid credentials until email is confirmed', async () => {
    const service = createAuthService({
      prisma: {
        user: {
          findUnique: async (): Promise<object> => ({
            id: 'user-1',
            email: 'student@example.edu',
            password: 'hashed-password',
            confirmedAt: null,
            profile: { id: 'user-1', userRole: 'basic' },
          }),
        },
      },
      tokenService: {
        comparePassword: async (): Promise<boolean> => true,
      },
    });

    await assert.rejects(
      () => service.login({ email: 'student@example.edu', password: 'Password1' }),
      ForbiddenException,
    );
  });

  it('revokes all refresh tokens after password reset', async () => {
    let updatedUserId = '';
    let updatedPassword = '';
    let revokedUserId = '';
    const service = createAuthService({
      prisma: {
        user: {
          update: async (args: { where: { id: string }; data: { password: string } }): Promise<object> => {
            updatedUserId = args.where.id;
            updatedPassword = args.data.password;
            return {};
          },
        },
      },
      tokenService: {
        consumePasswordResetToken: async (): Promise<string> => 'user-1',
        hashPassword: async (): Promise<string> => 'hashed-new-password',
        revokeAllRefreshTokensForUser: async (userId: string): Promise<void> => {
          revokedUserId = userId;
        },
      },
    });

    const response = await service.resetPassword({ token: 'reset-token', newPassword: 'Password2' });

    assert.equal(response.message, 'Password reset successfully');
    assert.equal(updatedUserId, 'user-1');
    assert.equal(updatedPassword, 'hashed-new-password');
    assert.equal(revokedUserId, 'user-1');
  });
});
