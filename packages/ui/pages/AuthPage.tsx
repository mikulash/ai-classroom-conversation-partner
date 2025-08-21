import React, { useEffect, useState } from 'react';
import { SignInForm, SignUpForm } from '../components/AuthForms';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router';
import { useSession } from '../hooks/useSession';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';

const AuthPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { signIn, signUp, loading, error } = useAuth();
  const { session, ready } = useSession();
  const { app_name } = useAppStore((state) => state.appConfig);

  const location = useLocation();
  const navigate = useNavigate();

  const [isSignIn, setIsSignIn] = useState(
    location.state?.isSignIn ?? true,
  );

  // Redirect to homepage once we know the user is authenticated
  useEffect(() => {
    if (ready && session) {
      navigate('/', { replace: true });
    }
  }, [ready, session, navigate]);

  if (!ready || session) {
    return null;
  }

  /** Wrap sign-in so we can redirect on success */
  const handleSignIn = async (email: string, password: string) => {
    const ok = await signIn(email, password);
    if (ok) navigate('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {t('welcomeTo', { appName: app_name })}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            {isSignIn ? t('signInToAccount') : t('createNewAccount')}
          </p>
        </header>

        {isSignIn ? (
          <SignInForm
            onSignIn={handleSignIn}
            onSwitchToSignUp={() => setIsSignIn(false)}
            isLoading={loading}
            error={error ?? undefined}
          />
        ) : (
          <SignUpForm
            onSignUp={signUp}
            onSwitchToSignIn={() => setIsSignIn(true)}
            isLoading={loading}
            error={error ?? undefined}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
