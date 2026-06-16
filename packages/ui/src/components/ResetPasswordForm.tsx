import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useResetPassword } from '../hooks/queries/useAuthMutations';

const MIN_PASSWORD_LENGTH = 8;

const buildResetPasswordSchema = (messages: { passwordsDontMatch: string; passwordTooShort: string }) =>
  z
    .object({
      newPassword: z.string().min(MIN_PASSWORD_LENGTH, { message: messages.passwordTooShort }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      message: messages.passwordsDontMatch,
    });

type ResetPasswordValues = z.infer<ReturnType<typeof buildResetPasswordSchema>>;

export const ResetPasswordForm: React.FC = () => {
  const { t } = useTypedTranslation();
  const [searchParams] = useSearchParams();
  const resetPassword = useResetPassword();

  const token = searchParams.get('token') ?? '';

  const schema = useMemo(
    () =>
      buildResetPasswordSchema({
        passwordsDontMatch: t('auth.password.mismatch', 'Passwords do not match'),
        passwordTooShort: t('auth.password.tooShort', 'Password must be at least 8 characters'),
      }),
    [t],
  );

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
    mode: 'onTouched',
  });

  const onSubmit = (values: ResetPasswordValues) => {
    resetPassword.mutate({ token, newPassword: values.newPassword });
  };

  const isSuccess = resetPassword.isSuccess;
  const submitError = resetPassword.error?.message ?? null;
  const isSubmitting = resetPassword.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      <Card className="p-4 sm:p-6 w-full max-w-md">
        {!token ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              {t('auth.password.resetInvalidLink', 'This reset link is invalid or has expired.')}
            </h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              {t('auth.password.resetNeedLink', 'Need a new link?')}
            </p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">{t('auth.password.requestResetLink', 'Request a new reset link')}</Link>
            </Button>
          </>
        ) : isSuccess ? (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              {t('auth.password.resetSuccess', 'Password reset!')}
            </h2>
            <p className="text-sm text-center text-muted-foreground mb-6">
              {t('auth.password.resetSuccessDescription', 'You can now sign in with your new password.')}
            </p>
            <Button asChild className="w-full">
              <Link to="/sign-in">{t('common.goToSignIn', 'Go to sign in')}</Link>
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
              {t('auth.password.setNew', 'Choose a new password')}
            </h2>
            <Form {...form}>
              <form onSubmit={(e) => {
                void form.handleSubmit(onSubmit)(e);
              }} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password.new', 'New password')}</FormLabel>
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
                      <FormLabel>{t('auth.password.confirm', 'Confirm password')}</FormLabel>
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

                {submitError && (
                  <div
                    role="alert"
                    className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {submitError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('common.loading.general') : t('auth.password.resetCta', 'Reset password')}
                </Button>
              </form>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};
