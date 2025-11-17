import React, { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useAuth } from '../hooks/useAuth';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

export const EmailVerificationExpiredPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { profile } = useAuth();
  const [email, setEmail] = useState(profile?.email ?? '');
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    }
  }, [profile?.email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError(t('emailVerificationExpiredEmailRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: resendError } = await authClient.resendVerificationEmail({ email: email.trim() });

    setIsSubmitting(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setStatus('success');
  };

  const tips = [
    t('emailVerificationCheckEmailTipSpam'),
    t('emailVerificationCheckEmailTipWait'),
    t('emailVerificationCheckEmailTipCorrect'),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="p-6 w-full max-w-md space-y-4 text-center">
          {status === 'form' ? (
            <>
              <h2 className="text-2xl font-bold">{t('emailVerificationExpiredTitle')}</h2>
              <p className="text-sm text-gray-700">
                {t('emailVerificationExpiredDescription')}
              </p>

              <form className="space-y-4" onSubmit={(e) => {
                void handleSubmit(e);
              }}>
                <div className="space-y-2 text-left">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                    }}
                    placeholder={t('emailVerificationExpiredEmailPlaceholder')}
                    aria-invalid={error ? 'true' : 'false'}
                  />
                </div>

                {error ? (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('loadingMessage') : t('emailVerificationExpiredPrimaryAction')}
                </Button>
              </form>

              <Button variant="link" asChild>
                <Link to="/sign-in">{t('emailVerificationExpiredSecondaryAction')}</Link>
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{t('emailVerificationCheckEmailTitle')}</h2>
              <p className="text-sm text-gray-700">
                {t('emailVerificationCheckEmailMessage')}
              </p>

              <ul className="space-y-2 text-left text-sm text-gray-700">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>

              <Button asChild className="w-full">
                <Link to="/sign-in">{t('emailVerificationExpiredSecondaryAction')}</Link>
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
