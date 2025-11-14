import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';
import { Card } from './ui/card';
import React, { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Link, useSearchParams } from 'react-router';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

export const ResetPasswordForm: React.FC = () => {
  const { t } = useTypedTranslation();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);

    const { error: resetError } = await authClient.resetPassword(token, newPassword);

    if (resetError) {
      setError(resetError.message);
    } else {
      setIsSuccess(true);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
      <Card className="p-4 sm:p-6 w-full max-w-md">
        {!token ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              {t('resetPasswordInvalidLink', 'This reset link is invalid or has expired.')}
            </h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              {t('resetPasswordNeedLink', 'Need a new link?')}
            </p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">{t('requestResetLink', 'Request a new reset link')}</Link>
            </Button>
          </>
        ) : isSuccess ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              {t('passwordResetSuccess', 'Password reset!')}
            </h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              {t('passwordResetSuccessDescription', 'You can now sign in with your new password.')}
            </p>
            <Button asChild className="w-full">
              <Link to="/sign-in">{t('goToSignIn', 'Go to sign in')}</Link>
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              {t('setNewPassword', 'Choose a new password')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('newPassword', 'New password')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('confirmPassword', 'Confirm password')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                />
              </div>

              {error && (
                <div className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading.general') : t('resetPasswordCta', 'Reset password')}
              </Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
};
