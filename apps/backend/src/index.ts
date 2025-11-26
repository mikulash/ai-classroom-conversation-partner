import { PORT, NODE_ENV } from './constants/constants.js';
import { startTokenCleanupScheduler } from './jobs/tokenCleanup';
import { createApp } from './server.js';

async function main() {
  const app = await createApp();

  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);

    // Start the token cleanup scheduler
    const tokenCleanupSchedule = process.env.TOKEN_CLEANUP_SCHEDULE ?? '0 2 * * *';
    startTokenCleanupScheduler(tokenCleanupSchedule);
  });
}

void main();
