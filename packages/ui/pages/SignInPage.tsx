import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useSession } from '../hooks/useSession';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';

export const SignInPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { signIn, loading, error } = useAuth();
  const { session, ready } = useSession();
  const { appName } = useAppStore((state) => state.appConfig);
  const ALLOWED_DOMAINS = useAppStore((state) => state.appConfig?.allowedDomains) || [];
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientErr, setClientErr] = useState<string | null>(null);

  const INVALID_MAIL_MSG = t('invalidEmailDomains', { domains: ALLOWED_DOMAINS.join(' or ') });

  // Redirect to homepage once we know the user is authenticated
  useEffect(() => {
    if (ready && session) {
      navigate('/', { replace: true });
    }
  }, [ready, session, navigate]);

  if (!ready || session) {
    return null;
  }

  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Always enforce allowed domains
    setClientErr(
      isValidUniversityEmail(value, ALLOWED_DOMAINS) ? null : INVALID_MAIL_MSG,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUniversityEmail(email, ALLOWED_DOMAINS)) {
      setClientErr(INVALID_MAIL_MSG);
      return;
    }
    const ok = await signIn(email, password);
    if (ok) navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('welcomeTo', { appName: appName })}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            {t('signInToAccount')}
          </p>
        </header>

        <Card className="p-4 sm:p-6 w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('signIn')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={t('emailPlaceholder', { allowedDomains: ALLOWED_DOMAINS.join(', ') })}
                required
              />
              {clientErr && <p className="text-red-500 text-sm">{clientErr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                <p>{t('error')}: {error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !!clientErr}
              className="w-full"
            >
              {loading ? t('loading.general') : t('signIn')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm">
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-500 hover:underline"
              >
                {t('register')}
              </button>
            </p>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs sm:text-sm text-blue-500 hover:underline"
            >
              {t('forgotPassword', 'Forgot password?')}
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
};
