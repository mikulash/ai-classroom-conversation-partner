import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../../services/token.service';
import { JWTPayload } from '../../utils/auth';
import { AuthenticatedRequest, AuthGuard } from './auth.guard';

function contextFor(request: AuthenticatedRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: <T>(): T => request as T,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('rejects requests without a bearer token', () => {
    const guard = new AuthGuard({} as unknown as TokenService);
    const request = { headers: {} } as AuthenticatedRequest;

    assert.throws(() => guard.canActivate(contextFor(request)), UnauthorizedException);
  });

  it('attaches the verified JWT payload to the request', () => {
    const payload: JWTPayload = {
      userId: 'user-1',
      email: 'student@example.edu',
      userRole: 'basic',
    };
    let receivedToken = '';
    const guard = new AuthGuard({
      verifyAccessToken: (token: string): JWTPayload => {
        receivedToken = token;
        return payload;
      },
    } as unknown as TokenService);
    const request = {
      headers: {
        authorization: 'Bearer raw-token',
      },
    } as AuthenticatedRequest;

    assert.equal(guard.canActivate(contextFor(request)), true);
    assert.equal(receivedToken, 'raw-token');
    assert.deepEqual(request.user, payload);
  });

  it('normalizes token verification failures to UnauthorizedException', () => {
    const guard = new AuthGuard({
      verifyAccessToken: (): JWTPayload => {
        throw new Error('invalid');
      },
    } as unknown as TokenService);
    const request = {
      headers: {
        authorization: 'Bearer bad-token',
      },
    } as AuthenticatedRequest;

    assert.throws(() => guard.canActivate(contextFor(request)), UnauthorizedException);
  });
});
