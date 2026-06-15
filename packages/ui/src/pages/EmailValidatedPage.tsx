import React, { useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useAuth } from '../hooks/useAuth';
import { useVerifyEmail } from '../hooks/queries/useAuthMutations';

type VerificationStatus = 'loading' | 'success' | 'error' | 'missingToken';

export const EmailValidatedPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { applySession } = useAuth();
  const verifyEmail = useVerifyEmail();

  // Strict-Mode-safe: only fire the mutation once per mounted page.
  const hasFiredRef = useRef(false);
  useEffect(() => {
    if (!token || hasFiredRef.current) return;
    hasFiredRef.current = true;

    verifyEmail.mutate(token, {
      onSuccess: (data) => {
        applySession(data.session);
      },
      onError: (err) => {
        if (err.message.toLowerCase().includes('expired')) {
          void navigate('/verification-expired', { replace: true });
        }
      },
    });
  }, [applySession, navigate, token, verifyEmail]);

  const status: VerificationStatus = !token ?
    'missingToken' :
    verifyEmail.isPending ?
      'loading' :
      verifyEmail.isError ?
        'error' :
        verifyEmail.isSuccess ?
          'success' :
          'loading';

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
      descriptionLines.push(verifyEmail.error?.message ?? t('emailValidationDefaultError'));
      actionTo = '/sign-in';
      actionLabel = t('goToSignIn');
      break;
    case 'missingToken':
      title = t('emailValidationMissingTokenTitle');
      descriptionLines.push(t('emailValidationMissingTokenMessage'));
      actionTo = '/sign-in';
      actionLabel = t('goToSignIn');
      break;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="p-6 w-full max-w-md space-y-4 text-center">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="space-y-2">
            {descriptionLines.map((line, index) => (
              <p key={index} className="text-sm text-muted-foreground">
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
