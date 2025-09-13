import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';
import { useAppStore } from '../hooks/useAppStore';
import { useNavigate } from 'react-router';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { RegisterUserRequest } from '@repo/shared/types/apiFigurantClient';

interface AuthFormProps {
    onSubmit: (email: string, password: string) => Promise<void>;
    submitButtonText: string;
    isLoading?: boolean;
    /** Accept any error shape – string | { message?: string; code?: any; reasons?: string[] } */
    error?: any;
}


export const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  submitButtonText,
  isLoading = false,
  error = null,
}) => {
  const { t } = useTypedTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const ALLOWED_DOMAINS = useAppStore((state) => state.appConfig?.allowed_domains) || [];
  const [clientErr, setClientErr] = useState<string | null>(null);
  const INVALID_MAIL_MSG = t('invalidEmailDomains', { domains: ALLOWED_DOMAINS.join(' or ') });

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
    await onSubmit(email, password);
  };

  const renderServerError = () => {
    if (!error) return null;

    const message =
            typeof error === 'string' ? error : error.message ?? t('unexpectedError');
    const code = typeof error === 'object' && error?.code;
    const reasons = typeof error === 'object' && error?.reasons;

    return (
      <div className="text-red-500 text-sm space-y-1">
        <p>{t('error')}: {message}</p>
        {code && <p>{t('code')}: {code}</p>}
        {Array.isArray(reasons) && reasons.length > 0 && (
          <ul className="list-disc list-inside ml-4">
            {reasons.map((r: string) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
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

      {renderServerError()}

      <Button
        type="submit"
        disabled={isLoading || !!clientErr}
        className="w-full"
      >
        {isLoading ? t('loading.general') : submitButtonText}
      </Button>

    </form>
  );
};

/**
 * ------------------------------------------------------------------------
 * Sign‑in wrapper component (re‑uses AuthForm)
 * ------------------------------------------------------------------------
 */
interface SignInFormProps {
    onSignIn: (email: string, password: string) => Promise<void>;
    onSwitchToSignUp: () => void;
    isLoading?: boolean;
    error?: any;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSignIn,
  onSwitchToSignUp,
  isLoading,
  error,
}) => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();

  return (
    <Card className="p-4 sm:p-6 w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('signIn')}</h2>
      <AuthForm
        onSubmit={onSignIn}
        submitButtonText={t('signIn')}
        isLoading={isLoading}
        error={error}
      />
      <div className="mt-4 text-center">
        <p className="text-xs sm:text-sm">
          {t('dontHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
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
  );
};


interface SignUpFormProps {
    onSignUp: (params: RegisterUserRequest) => Promise<void>;
    onSwitchToSignIn: () => void;
    isLoading?: boolean;
    error?: any;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSignUp,
  onSwitchToSignIn,
  isLoading = false,
  error,
}) => {
  const { t } = useTypedTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const ALLOWED_DOMAINS = useAppStore((state) => state.appConfig?.allowed_domains) || [];

  const [gender, setGender] = useState('');
  const [clientErr, setClientErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      await onSignUp({
        email,
        password,
        full_name: fullName,
        gender,
      });
      setSuccess(true);
    } catch (err) {
      // Parent handles displaying the error, we just avoid unhandled rejections.
      console.error('Error during sign-up:', err);
    }
  };

  const renderServerError = () => {
    if (!error) return null;

    const message =
            typeof error === 'string' ? error : error.message ?? t('unexpectedError');
    const code = typeof error === 'object' && error?.code;
    const reasons = typeof error === 'object' && error?.reasons;

    return (
      <div className="text-red-500 text-sm space-y-1">
        <p>{t('errorSigningUp')}: {message}</p>
        {code && <p>{t('code')}: {code}</p>}
        {Array.isArray(reasons) && reasons.length > 0 && (
          <ul className="list-disc list-inside ml-4">
            {reasons.map((r: string) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  if (success) {
    return (
      <Card className="p-4 sm:p-6 w-full space-y-3 sm:space-y-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold">{t('thanksForRegistering')} 🎉</h2>
        <p className="text-xs sm:text-sm text-gray-700">
          {t('confirmationEmailSent')}
        </p>

        <Button type="button" onClick={onSwitchToSignIn} className="w-full">
          {t('goToSignIn')}
        </Button>
      </Card>
    );
  }

  const isFormValid = !clientErr && !passwordErr && password && confirmPassword && fullName && email && gender;

  return (
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

        {renderServerError()}

        <Button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full"
        >
          {isLoading ? t('loading.general') : t('register')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm">
          {t('alreadyHaveAccount')}{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-blue-500 hover:underline"
          >
            {t('signIn')}
          </button>
        </p>
      </div>
    </Card>
  );
};
