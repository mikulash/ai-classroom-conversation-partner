import cron from 'node-cron';
import prisma from '../clients/prisma';

/**
 * Cleanup expired and revoked refresh tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Delete tokens that are either expired for at least 1 day or revoked
        const result = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    {expiresAt: {lt: oneDayAgo}},
                    {revoked: true},
                ],
            },
        });

        if (result.count > 0) {
            console.log(`[Token Cleanup] Successfully deleted ${result.count} expired/revoked tokens`);
        } else {
            console.log('[Token Cleanup] No expired/revoked tokens found');
        }
    } catch (error) {
        console.error('[Token Cleanup] Error during token cleanup:', error);
    }
}

/**
 * Start the token cleanup scheduler
 * @param schedule - Cron schedule expression (e.g., '0 2 * * *' for 2 AM daily)
 */
export function startTokenCleanupScheduler(schedule: string): void {
    // Validate cron expression
    let effectiveSchedule = schedule;
    if (!cron.validate(schedule)) {
        console.error(`[Token Cleanup] Invalid cron schedule: ${schedule}`);
        console.log('[Token Cleanup] Using default schedule: 0 2 * * * (2 AM daily)');
        effectiveSchedule = '0 2 * * *'; // Default to 2 AM daily
    }

    // Schedule the cleanup job
    cron.schedule(effectiveSchedule, async () => {
        console.log('[Token Cleanup] Running scheduled token cleanup...');
        await cleanupExpiredTokens();
    });

    console.log(`[Token Cleanup] Scheduler started with schedule: ${effectiveSchedule}`);
}
