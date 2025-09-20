import { CustomModelSelection } from '@repo/shared/types/supabase/supabaseTypeHelpers';
import { fetchUserCustomModelConfig } from './supabaseAdminService';

const nullConfigCache = new Map<string, number>(); // userId -> expiration timestamp
const NULL_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
/**
 * Retrieves the custom AI model configuration for admin users.
 * This enables testing of different AI models.
 * Implements caching to minimize unnecessary requests to Supabase, as most users do not have a custom config.
 * @param userId - received by supabase authentication
 */
export async function getUserCustomModelConfig(userId: string): Promise<CustomModelSelection | null> {
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
