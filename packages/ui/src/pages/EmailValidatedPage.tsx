import React, { useEffect } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useAuth } from '../hooks/useAuth';
import { authClient } from '@repo/frontend-utils/src/clients/db/auth.client';
import { unwrap } from '../hooks/queries/unwrap';

export const EmailValidatedPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { applySession } = useAuth();

  // The verification call is modelled as a query (one shot, keyed by the
  // token). RQ handles:
  //   - StrictMode double-mount dedupe (same key, no second request)
  //   - unmount cancellation (no `isMountedRef` dance)
  //   - retries for transient failures
  //   - caching so navigating back doesn't re-fire the call
  const verification = useQuery({
    queryKey: ['auth', 'verifyEmail', token],
    queryFn: () => authClient.verifyEmail(token ?? '').then(unwrap),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Apply the session exactly once when verification succeeds.
  useEffect(() => {
    if (verification.data) {
      applySession(verification.data.session);
    }
  }, [verification.data, applySession]);

  if (!token) {
    return (
      <ResultCard
        title={t('emailValidationMissingTokenTitle')}
        descriptionLines={[t('emailValidationMissingTokenMessage')]}
        actionTo="/sign-in"
        actionLabel={t('goToSignIn')}
      />
    );
  }

  if (verification.isPending) {
    return (
      <ResultCard
        title={t('emailValidationInProgressTitle')}
        descriptionLines={[t('emailValidationInProgressMessage')]}
      />
    );
  }

  if (verification.isError) {
    const message = verification.error.message;
    // Expired tokens get their own page; everything else stays here.
    if (message.toLowerCase().includes('expired')) {
      return <Navigate to="/verification-expired" replace />;
    }
    return (
      <ResultCard
        title={t('emailValidationFailedTitle')}
        descriptionLines={[message]}
        actionTo="/sign-in"
        actionLabel={t('goToSignIn')}
      />
    );
  }

  return (
    <ResultCard
      title={t('emailValidatedSuccess')}
      descriptionLines={[t('emailValidatedMessage')]}
      actionTo="/chat"
      actionLabel={t('goToPersonalitySelector')}
    />
  );
};

interface ResultCardProps {
  title: string;
  descriptionLines: string[];
  actionTo?: string;
  actionLabel?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  title,
  descriptionLines,
  actionTo,
  actionLabel,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div className="w-full max-w-md space-y-8 text-center">
      <Card className="p-6 w-full max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="space-y-2">
          {descriptionLines.map((line, index) => (
            <p key={index} className="text-sm text-gray-700">{line}</p>
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
