import { Request } from 'express';
import { supabaseAdmin } from '../clients/supabase';

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
