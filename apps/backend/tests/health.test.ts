/// <reference types="vitest" />
import request from 'supertest';

import { createApp } from '../src/server.js';

describe('Backend health endpoints', () => {
  it('responds with a welcome message on the root route', async () => {
    const app = await createApp({ includeDbRoutes: false, includeLegacyRoutes: false });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('API is running');
  });

  it('returns a healthy status payload', async () => {
    const app = await createApp({ includeDbRoutes: false, includeLegacyRoutes: false });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('applies CORS headers for the configured frontend origin', async () => {
    const app = await createApp({ includeDbRoutes: false, includeLegacyRoutes: false });

    const response = await request(app).get('/health').set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });
});
