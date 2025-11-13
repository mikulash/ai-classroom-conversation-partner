import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';
import { Card } from './ui/card';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Link, useNavigate } from 'react-router';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useAuth } from '../hooks/useAuth';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

export const ResetPasswordForm: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session, ready } = useAuth();

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!session) {
      navigate('/', { replace: true });
    }
  }, [navigate, ready, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError(t('currentPasswordRequired', 'Current password is required'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch', 'Passwords do not match'));
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.updatePassword(currentPassword, newPassword);
    if (error) {
      setError(error.message);
    } else {
      setIsSuccess(true);
    }

    setIsLoading(false);
  };

  return (
    <Card className="p-4 sm:p-6 w-full max-w-md">
      {isSuccess ? (
        <>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
            {t('passwordUpdated', 'Password updated! ✅')}
          </h2>
          <Button asChild className="w-full">
            <Link to="/">{t('goToHome')}</Link>
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
            {t('setNewPassword', 'Choose a new password')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t('currentPassword', 'Current password')}
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('currentPasswordPlaceholder', 'Enter current password')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword', 'New password')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('loading.general') : t('updatePassword', 'Update password')}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
};
