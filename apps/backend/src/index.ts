import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PORT, NODE_ENV } from './constants/constants.js';
import { startTokenCleanupScheduler } from './jobs/tokenCleanup';

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

// Middleware
app.use(express.json());
app.use(cors());

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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);

  // Start the token cleanup scheduler
  const tokenCleanupSchedule = process.env.TOKEN_CLEANUP_SCHEDULE ?? '0 2 * * *';
  startTokenCleanupScheduler(tokenCleanupSchedule);
});
