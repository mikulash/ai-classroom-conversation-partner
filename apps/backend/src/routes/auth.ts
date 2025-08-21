import { Request, Response, Router } from 'express';
import { supabaseAdmin } from '../clients/supabase';
import { AuthResponse } from '@supabase/supabase-js';
import { RegisterUserBody } from '@repo/shared/types/api/RegisterUserBody';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';
import { ConfigProvider } from '../utils/configProvider';

const router = Router({ mergeParams: true });

router.all('/', (req, res) => {
  res.status(200).json({ message: 'Hello from auth!' });
});

// Register a new user with email validation against allowed university domains
router.post(
  '/register',
  async (
    req: Request<RegisterUserBody>,
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
