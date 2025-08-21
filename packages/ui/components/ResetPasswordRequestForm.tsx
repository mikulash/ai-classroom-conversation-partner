import { Label } from '@radix-ui/react-label';
import { supabase } from '@repo/api-client/src/supabase';
import { Input } from './ui/input';
import { Card } from './ui/card';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export const ResetPasswordRequestForm: React.FC = () => {
  const { t } = useTypedTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ALLOWED_DOMAINS = useAppStore((state) => state.appConfig?.allowed_domains) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        t('resetLinkSent', 'We\'ve emailed you a reset link – check your inbox!'),
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">

      <Card className="p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          {t('forgotPassword', 'Forgot your password?')}
        </h2>

        {message ? (
          <p className="text-center text-xs sm:text-sm text-green-600">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder', { allowedDomains: ALLOWED_DOMAINS.join(', ') })}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loading') : t('sendResetLink', 'Send reset link')}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
