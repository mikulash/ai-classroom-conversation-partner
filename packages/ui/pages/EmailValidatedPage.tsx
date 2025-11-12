import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { authApi } from '@repo/frontend-utils/src/apiService';
import { useUserStore } from '../hooks/useUserStore';

type VerificationStatus = 'loading' | 'success' | 'error' | 'missingToken';

export const EmailValidatedPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const setProfile = useUserStore((state) => state.setProfile);
  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'missingToken');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let redirectTimeout: number | undefined;

    if (!token) {
      setStatus('missingToken');
      setErrorMessage(null);
      return () => {
        isMounted = false;
      };
    }

    setStatus('loading');
    setErrorMessage(null);

    void (async () => {
      const { data, error } = await authApi.verifyEmail(token);

      if (!isMounted) {
        return;
      }

      if (error || !data?.user) {
        setStatus('error');
        setErrorMessage(error?.message ?? null);
        return;
      }

      setProfile(data.user);
      setStatus('success');

      redirectTimeout = window.setTimeout(() => {
        navigate('/chat');
      }, 2000);
    })();

    return () => {
      isMounted = false;
      if (redirectTimeout !== undefined) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [navigate, setProfile, token]);

  let title = '';
  const descriptionLines: string[] = [];
  let actionTo: string | null = null;
  let actionLabel: string | null = null;

  switch (status) {
    case 'loading':
      title = t('emailValidationInProgressTitle');
      descriptionLines.push(t('emailValidationInProgressMessage'));
      break;
    case 'success':
      title = t('emailValidatedSuccess');
      descriptionLines.push(t('emailValidatedMessage'));
      descriptionLines.push(t('emailValidationRedirectMessage'));
      actionTo = '/chat';
      actionLabel = t('goToPersonalitySelector');
      break;
    case 'error':
      title = t('emailValidationFailedTitle');
      descriptionLines.push(errorMessage ?? t('emailValidationDefaultError'));
      actionTo = '/sign-in';
      actionLabel = t('goToSignIn');
      break;
    case 'missingToken':
      title = t('emailValidationMissingTokenTitle');
      descriptionLines.push(t('emailValidationMissingTokenMessage'));
      actionTo = '/sign-in';
      actionLabel = t('goToSignIn');
      break;
    default:
      break;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="p-6 w-full max-w-md space-y-4 text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="space-y-2">
            {descriptionLines.map((line, index) => (
              <p key={index} className="text-sm text-gray-700">
                {line}
              </p>
            ))}
          </div>

          {actionTo && actionLabel ? (
            <Button asChild className="w-full">
              <Link to={actionTo}>{actionLabel}</Link>
            </Button>
          ) : null}
        </Card>
      </div>
    </div>
  );
};

