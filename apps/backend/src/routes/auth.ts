import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../clients/supabase';
import { AuthResponse } from '@supabase/supabase-js';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';
import { ConfigProvider } from '../utils/configProvider';
import { RegisterUserRequest } from '@repo/shared/types/apiFigurantClient';

const router = Router({ mergeParams: true });

/**
 * Health check endpoint for the auth service.
 * Useful for debugging or development to verify the route is reachable.
 */
router.all('/', (req, res) => {
  res.status(200).json({ message: 'Hello from auth!' });
});

/**
 * Registers a new user.
 * - Only allows registration for emails matching allowed university domains (e\.g\. MUNI students).
 * - Authentication is managed and stored via Supabase.
 * - Validates email domain before creating the user.
 */
router.post(
  '/register',
  async (
    req: Request<unknown, unknown, RegisterUserRequest>,
    res: Response<AuthResponse | string>,
  ) => {
    const { email, password, full_name, gender } = req.body;

    const configProvider = await ConfigProvider.getInstance();
    const ALLOWED_DOMAINS = configProvider.getAppConfig().allowed_domains ?? [];

    if (!isValidUniversityEmail(email, ALLOWED_DOMAINS)) {
      res.status(400).json('Email must end with' + ALLOWED_DOMAINS.join(', '));
      return;
    }

    const authResponse = await supabaseAdmin.auth.signUp(
      {
        email, password, options: {
          data: { full_name: full_name, gender: gender },
        },
      },
    );

    if (authResponse.error) {
      console.error('[register] supabase error:', authResponse.error);
      res.status(500).json(authResponse.error.message);
      return;
    }

    res.json(authResponse);
  },
);

export default router;
