import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useAuth } from '../hooks/useAuth';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';

type VerificationStatus = 'loading' | 'success' | 'error' | 'missingToken';

export const EmailValidatedPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { applySession } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'missingToken');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    if (!token) {
      setStatus('missingToken');
      setErrorMessage(null);
      return () => {
        isMountedRef.current = false;
      };
    }

    // Prevent duplicate verification attempts (React 18 Strict Mode issue)
    if (hasVerifiedRef.current) {
      return () => {
        isMountedRef.current = false;
      };
    }

    hasVerifiedRef.current = true;
    setStatus('loading');
    setErrorMessage(null);

    void (async () => {
      const { data, error } = await authClient.verifyEmail(token);

      if (!isMountedRef.current) {
        return;
      }

      if (error) {
        const message = error.message;

        if (message.toLowerCase().includes('expired')) {
          void navigate('/verification-expired', { replace: true });
          return;
        }

        setStatus('error');
        setErrorMessage(message);
        return;
      }

      applySession(data.session);
      setStatus('success');
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, [applySession, navigate, token]);

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

