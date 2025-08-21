import React from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

const EmailValidatedPage: React.FC = () => {
  const { t } = useTypedTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="p-6 w-full max-w-md space-y-4 text-center">
          <h2 className="text-2xl font-bold">{t('emailValidatedSuccess')}</h2>
          <p className="text-sm text-gray-700">
            {t('emailValidatedMessage')}
          </p>

          <Button asChild className="w-full">
            <Link to="/auth" state={{ isSignIn: true }}>{t('goToSignIn')}</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default EmailValidatedPage;
