import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

export const HomePage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { session, ready } = useAuth();
  const user = session?.user;
  const isAuthenticated = !!user;
  const appName = useAppStore((state) => state.appConfig.appName);

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 text-center">
        <header>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            {t('welcomeTo', { appName: appName })}
          </h1>
          <p className="mt-2 sm:mt-4 text-lg sm:text-xl text-muted-foreground">
            {t('aiConversationPartner')}
          </p>
        </header>

        <div className="mt-8">
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                {t('helloSignedIn', { name: user.fullName.trim() || user.email })}
              </p>
              <Button
                className="w-full py-4 sm:py-6 text-lg sm:text-xl bg-green-700 hover:bg-green-800 text-white"
                asChild>
                <Link to="/chat">{t('goToPersonalitySelector')}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                {t('pleaseSignInMessage', { appName: appName })}
              </p>
              <div className="flex flex-col space-y-4">
                <Button
                  className="w-full py-4 sm:py-6 text-lg sm:text-xl bg-green-700 hover:bg-green-800 text-white"
                  asChild
                >
                  <Link to="/sign-in">
                    {t('signIn')}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full py-4 sm:py-6 text-lg sm:text-xl" asChild>
                  <Link to="/register">
                    {t('register')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

