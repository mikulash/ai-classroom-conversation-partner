import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../clients/supabase';

export const verifySupabaseAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.header('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);


  if (error || !user) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  next();
};
