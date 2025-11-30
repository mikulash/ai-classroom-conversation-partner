import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PORT, NODE_ENV, APP_FRONTEND_URL } from './constants/constants.js';
import { startTokenCleanupScheduler } from './jobs/tokenCleanup';
import prisma from './clients/prisma.js';

// Legacy routes
import replyRoutes from './routes/replies.router.js';

// New API routes
import authRoutes from './routes/db/auth.router.js';
import profilesRoutes from './routes/db/profiles.router.js';
import conversationsRoutes from './routes/db/conversations.router.js';
import personalitiesRoutes from './routes/db/personalities.router.js';
import scenariosRoutes from './routes/db/scenarios.router.js';
import modelsRoutes from './routes/db/models.router.js';
import appConfigRoutes from './routes/db/app-config.router.js';
import conversationRolesRoutes from './routes/db/conversation-roles.router.js';

const app = express();
app.disable('x-powered-by');

// Middleware
app.use(express.json());
app.use(cors({
  origin: APP_FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/personalities', personalitiesRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/app-config', appConfigRoutes);
app.use('/api/conversation-roles', conversationRolesRoutes);

// Legacy routes (for backward compatibility)
app.use('/replies', replyRoutes);

app.get('/', (req, res) => {
  res.send('API is running - Refactored with Prisma & JWT Auth');
});

// Health Check
app.get('/health', async (_req, res) => {
    const timestamp = new Date().toISOString();
    const start = Date.now();

    try {
        await prisma.$connect();
        const latencyMs = Date.now() - start;

        console.log(`[Health] OK - database responsive in ${latencyMs}ms`);

        res.status(200).json({
            status: 'ok',
            timestamp,
            checks: {
                database: 'ok',
                latencyMs,
            },
        });
    } catch (error) {
        console.error('[Health] FAILED - database check error', error);

        res.status(503).json({
            status: 'error',
            timestamp,
            checks: {
                   database: {
                    status: 'error',
                    message: 'Can\'t reach database server',
                },
            },
        });
    }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);

  // Start the token cleanup scheduler
  const tokenCleanupSchedule = process.env.TOKEN_CLEANUP_SCHEDULE ?? '0 2 * * *';
  startTokenCleanupScheduler(tokenCleanupSchedule);
});
