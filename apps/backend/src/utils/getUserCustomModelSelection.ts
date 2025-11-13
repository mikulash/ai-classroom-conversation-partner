import { fetchUserCustomModelConfig } from './databaseService';
import { AdminUserCustomModelSelection } from '../generated/prisma/client';

const nullConfigCache = new Map<string, number>(); // userId -> expiration timestamp
const NULL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
/**
 * Retrieves the custom AI model configuration for admin users.
 * This enables testing of different AI models.
 * Implements caching to minimize unnecessary database requests, as most users do not have a custom config.
 * @param userId - user identifier
 */
export async function getUserCustomModelConfig(userId: string): Promise<AdminUserCustomModelSelection | null> {
  if (!userId) return null;

  // Check if userId is cached as null
  const cachedExpiry = nullConfigCache.get(userId);
  if (cachedExpiry && cachedExpiry > Date.now()) {
    return null;
  } else if (cachedExpiry) {
    // expired, remove it
    nullConfigCache.delete(userId);
  }

  try {
    const config = await fetchUserCustomModelConfig(userId);

    if (!config) {
      // Cache the null result with expiry
      nullConfigCache.set(userId, Date.now() + NULL_CACHE_TTL_MS);
      return null;
    }

    return config;
  } catch (error) {
    console.error('Error in getUserCustomModelConfig:', error);
    return null;
  }
}
