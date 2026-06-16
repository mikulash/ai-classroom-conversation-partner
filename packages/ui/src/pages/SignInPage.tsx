import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';

const buildSignInSchema = (allowedDomains: string[], invalidDomainMessage: string) =>
  z.object({
    email: z
      .string()
      .email()
      .refine((value) => isValidUniversityEmail(value, allowedDomains), {
        message: invalidDomainMessage,
      }),
    password: z.string().min(1),
  });

type SignInValues = z.infer<ReturnType<typeof buildSignInSchema>>;

export const SignInPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { signIn, error, session, ready } = useAuth();
  const appName = useAppStore((state) => state.appConfig.appName);
  const allowedDomains = useAppStore((state) => state.appConfig.allowedDomains);
  const navigate = useNavigate();

  const invalidDomainMessage = t('auth.invalidEmailDomains', {
    domains: allowedDomains.join(' or '),
  });

  const schema = useMemo(
    () => buildSignInSchema(allowedDomains, invalidDomainMessage),
    [allowedDomains, invalidDomainMessage],
  );

  const form = useForm<SignInValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (ready && session) {
      void navigate('/', { replace: true });
    }
  }, [ready, session, navigate]);

  if (!ready || session) {
    return null;
  }

  const onSubmit = async (values: SignInValues) => {
    const ok = await signIn(values.email, values.password);
    if (ok) void navigate('/chat');
  };

  const { isSubmitting } = form.formState;

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {t('home.welcomeTo', { appName })}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            {t('auth.signInToAccount')}
          </p>
        </header>

        <Card className="p-4 sm:p-6 w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('auth.signIn')}</h2>

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder={t('auth.emailPlaceholder', { allowedDomains: allowedDomains.join(', ') })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password.label')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder={t('auth.password.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-destructive text-sm" role="alert">
                  {t('common.error')}: {error}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t('common.loading.general') : t('auth.signIn')}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm">
              {t('auth.dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  void navigate('/register');
                }}
                className="text-blue-700 dark:text-blue-400 hover:underline"
              >
                {t('auth.register')}
              </button>
            </p>
            <button
              type="button"
              onClick={() => {
                void navigate('/forgot-password');
              }}
              className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 hover:underline"
            >
              {t('auth.forgotPassword', 'Forgot password?')}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
