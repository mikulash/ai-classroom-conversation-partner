import { Request } from 'express';
import { supabaseAdmin } from '../clients/supabase';

/**
 * Extracts the user ID from a request's Bearer token using Supabase authentication.
 * Throws an error if the token is missing, invalid, or expired.
 *
 * @param {Request} req - The Express request object containing the authorization header.
 * @returns {Promise<string>} The authenticated user's ID.
 * @throws {Error} If the bearer token is missing, invalid, or expired.
 */
export async function getUserId(req: Request): Promise<string> {
  const auth = req.header('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    throw new Error('Missing bearer token');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  return user.id;
}
