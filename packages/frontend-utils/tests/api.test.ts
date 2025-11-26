/// <reference types="vitest" />
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../src/clients/api';

describe('shared API client', () => {
  let apiMock: MockAdapter;
  let rootMock: MockAdapter;

  beforeEach(() => {
    apiMock = new MockAdapter(api);
    rootMock = new MockAdapter(axios);
    localStorage.clear();
  });

  afterEach(() => {
    apiMock.restore();
    rootMock.restore();
  });

  it('attaches the access token to outbound requests', async () => {
    localStorage.setItem('access_token', 'test-access');

    apiMock.onGet('/protected').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer test-access');
      return [200, { ok: true }];
    });

    const response = await api.get<{ ok: boolean }>('/protected');

    expect(response.data.ok).toBe(true);
  });

  it('refreshes tokens on 401 responses and retries the request', async () => {
    localStorage.setItem('refresh_token', 'refresh-me');

    const refreshedTokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };

    apiMock.onGet('/retry-me').replyOnce(401);
    rootMock.onPost('http://localhost:4000/api/auth/refresh').reply((config) => {
      const payload = JSON.parse(config.data as string);
      expect(payload.refreshToken).toBe('refresh-me');
      return [200, refreshedTokens];
    });
    apiMock.onGet('/retry-me').reply(200, { ok: true });

    const response = await api.get<{ ok: boolean }>('/retry-me');

    expect(response.data.ok).toBe(true);
    expect(localStorage.getItem('access_token')).toBe('new-access');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
  });
});
