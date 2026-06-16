import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { isValidUniversityEmail } from '@repo/shared/utils/isValidUniversityEmail';

const MIN_PASSWORD_LENGTH = 8;

const buildRegistrationSchema = (
  allowedDomains: string[],
  messages: {
    invalidDomain: string;
    passwordsDontMatch: string;
    passwordTooShort: string;
  },
) =>
  z
    .object({
      fullName: z.string().trim().min(1),
      gender: z.string().trim().min(1),
      email: z
        .string()
        .email()
        .refine((value) => isValidUniversityEmail(value, allowedDomains), {
          message: messages.invalidDomain,
        }),
      password: z.string().min(MIN_PASSWORD_LENGTH, { message: messages.passwordTooShort }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: messages.passwordsDontMatch,
    });

type RegistrationValues = z.infer<ReturnType<typeof buildRegistrationSchema>>;

export const RegistrationPage: React.FC = () => {
  const { t } = useTypedTranslation();
  const { signUp, error, session, ready } = useAuth();
  const appName = useAppStore((state) => state.appConfig.appName);
  const allowedDomains = useAppStore((state) => state.appConfig.allowedDomains);
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);

  const schema = useMemo(
    () =>
      buildRegistrationSchema(allowedDomains, {
        invalidDomain: t('auth.invalidEmailFormat', { allowedDomains: allowedDomains.join(', ') }),
        passwordsDontMatch: t('auth.password.mismatch', 'Passwords don\'t match'),
        passwordTooShort: t('auth.password.tooShort', 'Password must be at least 8 characters'),
      }),
    [allowedDomains, t],
  );

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      gender: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (ready && session) {
      void navigate('/', { replace: true });
    }
  }, [ready, session, navigate]);

  if (!ready || session) {
    return null;
  }

  const onSubmit = async (values: RegistrationValues) => {
    const ok = await signUp({
      email: values.email,
      password: values.password,
      fullName: values.fullName,
      gender: values.gender,
    });
    if (ok) setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
        <div className="w-full max-w-md">
          <Card className="p-4 sm:p-6 w-full space-y-3 sm:space-y-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold">{t('auth.thanksForRegistering')} 🎉</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('auth.confirmationEmailSent')}</p>
            <Button type="button" onClick={() => {
              void navigate('/sign-in');
            }} className="w-full">
              {t('common.goToSignIn')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const { isSubmitting } = form.formState;

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {t('home.welcomeTo', { appName })}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            {t('auth.createNewAccount')}
          </p>
        </header>

        <Card className="p-4 sm:p-6 w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('auth.register')}</h2>

          <Form {...form}>
            <form onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile.fullName')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="name"
                        placeholder={t('profile.fullNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('profile.gender')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        autoComplete="sex"
                        placeholder={t('profile.genderPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

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
                        autoComplete="new-password"
                        placeholder={t('auth.password.placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.password.confirm', 'Confirm Password')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder={t('auth.password.confirmPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-destructive text-sm" role="alert">
                  {t('auth.errorSigningUp')}: {error}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? t('common.loading.general') : t('auth.register')}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  void navigate('/sign-in');
                }}
                className="text-blue-700 dark:text-blue-400 hover:underline"
              >
                {t('auth.signIn')}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
