import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useSession } from '../hooks/useSession';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';

export const RegistrationPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { signUp, loading, error } = useAuth();
  const { session, ready } = useSession();
  const { appName } = useAppStore((state) => state.appConfig);
  const ALLOWED_DOMAINS = useAppStore((state) => state.appConfig?.allowedDomains) || [];
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [clientErr, setClientErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setClientErr(
      isValidUniversityEmail(value, ALLOWED_DOMAINS) ? null : t('invalidEmailFormat', { allowedDomains: ALLOWED_DOMAINS.join(', ') }),
    );
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordErr(t('passwordsDontMatch') || 'Passwords don\'t match');
      return false;
    }

    if (password.length < 8) {
      setPasswordErr(t('passwordTooShort') || 'Password must be at least 8 characters');
      return false;
    }

    setPasswordErr(null);
    return true;
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
    // Clear password error when typing to give immediate feedback
    if (e.target.value === confirmPassword) {
      setPasswordErr(null);
    } else if (confirmPassword) {
      // Only show error if confirmPassword field has been filled already
      setPasswordErr(t('passwordsDontMatch') || 'Passwords don\'t match');
    }
  };

  const handleConfirmPasswordChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setConfirmPassword(e.target.value);
    // Clear password error when typing to give immediate feedback
    if (e.target.value === password) {
      setPasswordErr(null);
    } else {
      setPasswordErr(t('passwordsDontMatch') || 'Passwords don\'t match');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!isValidUniversityEmail(email, ALLOWED_DOMAINS)) {
      setClientErr(t('invalidEmailFormat'));
      return;
    }

    // Validate passwords match
    if (!validatePasswords()) {
      return;
    }

    try {
      await signUp({
        email,
        password,
        full_name: fullName,
        gender,
      });
      setIsSuccess(true);
    } catch (err) {
      // Parent handles displaying the error, we just avoid unhandled rejections.
      console.error('Error during sign-up:', err);
    }
  };

  const isFormValid = !clientErr && !passwordErr && password && confirmPassword && fullName && email && gender;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
        <div className="w-full max-w-md">
          <Card className="p-4 sm:p-6 w-full space-y-3 sm:space-y-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold">{t('thanksForRegistering')} 🎉</h2>
            <p className="text-xs sm:text-sm text-gray-700">
              {t('confirmationEmailSent')}
            </p>

            <Button type="button" onClick={() => navigate('/sign-in')} className="w-full">
              {t('goToSignIn')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('welcomeTo', { appName: appName })}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            {t('createNewAccount')}
          </p>
        </header>

        <Card className="p-4 sm:p-6 w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('register')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('fullNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">{t('gender')}</Label>
              <Input
                id="gender"
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder={t('genderPlaceholder')}
                required
              />
            </div>

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
                onChange={handlePasswordChange}
                placeholder={t('passwordPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword', 'Confirm Password')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder={t('confirmPasswordPlaceholder')}
                required
              />
              {passwordErr && <p className="text-red-500 text-sm">{passwordErr}</p>}
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                <p>{t('errorSigningUp')}: {error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full"
            >
              {loading ? t('loading.general') : t('register')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm">
              {t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/sign-in')}
                className="text-blue-500 hover:underline"
              >
                {t('signIn')}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
