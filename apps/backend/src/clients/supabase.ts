import { createClient } from '@supabase/supabase-js';
import { Database } from '@repo/shared/types/supabase/database.types';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

