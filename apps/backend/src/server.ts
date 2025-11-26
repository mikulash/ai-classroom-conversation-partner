import 'dotenv/config';
import cors from 'cors';
import express, { type Express } from 'express';

import { APP_FRONTEND_URL } from './constants/constants.js';

export type CreateAppOptions = {
  includeDbRoutes?: boolean;
  includeLegacyRoutes?: boolean;
};

export async function createApp({
  includeDbRoutes = true,
  includeLegacyRoutes = true,
}: CreateAppOptions = {}): Promise<Express> {
  const app = express();
  app.disable('x-powered-by');

  // Middleware
  app.use(express.json());
  app.use(
    cors({
      origin: APP_FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // 24 hours
    }),
  );

  // API Routes (loaded lazily so tests can opt-out of heavy dependencies)
  if (includeDbRoutes) {
    const [authRoutes, profilesRoutes, conversationsRoutes, personalitiesRoutes, scenariosRoutes, modelsRoutes, appConfigRoutes, conversationRolesRoutes] =
      await Promise.all([
        import('./routes/db/auth.router.js'),
        import('./routes/db/profiles.router.js'),
        import('./routes/db/conversations.router.js'),
        import('./routes/db/personalities.router.js'),
        import('./routes/db/scenarios.router.js'),
        import('./routes/db/models.router.js'),
        import('./routes/db/app-config.router.js'),
        import('./routes/db/conversation-roles.router.js'),
      ]);

    app.use('/api/auth', authRoutes.default);
    app.use('/api/profiles', profilesRoutes.default);
    app.use('/api/conversations', conversationsRoutes.default);
    app.use('/api/personalities', personalitiesRoutes.default);
    app.use('/api/scenarios', scenariosRoutes.default);
    app.use('/api/models', modelsRoutes.default);
    app.use('/api/app-config', appConfigRoutes.default);
    app.use('/api/conversation-roles', conversationRolesRoutes.default);
  }

  if (includeLegacyRoutes) {
    const replyRoutes = await import('./routes/replies.router.js');
    app.use('/replies', replyRoutes.default);
  }

  app.get('/', (_req, res) => {
    res.send('API is running - Refactored with Prisma & JWT Auth');
  });

  // Health Check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
