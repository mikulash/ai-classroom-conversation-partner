import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PORT, NODE_ENV } from './constants/constants.js';

// Legacy routes
import replyRoutes from './routes/replies.js';

// New API routes
import authRoutes from './routes/api/auth-router.js';
import profilesRoutes from './routes/api/profiles-router.js';
import conversationsRoutes from './routes/api/conversations-router.js';
import personalitiesRoutes from './routes/api/personalities-router.js';
import scenariosRoutes from './routes/api/scenarios-router.js';
import modelsRoutes from './routes/api/models-router.js';
import appConfigRoutes from './routes/api/app-config-router.js';
import conversationRolesRoutes from './routes/api/conversation-roles-router.js';

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
});
