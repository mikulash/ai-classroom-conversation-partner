import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useAppStore } from '../hooks/useAppStore';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { useRequestPasswordReset } from '../hooks/queries/useAuthMutations';

const requestResetSchema = z.object({
  email: z.string().email(),
});

type RequestResetValues = z.infer<typeof requestResetSchema>;

export const ResetPasswordRequestForm: React.FC = () => {
  const { t } = useTypedTranslation();
  const allowedDomains = useAppStore((state) => state.appConfig.allowedDomains);
  const requestReset = useRequestPasswordReset();

  const form = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = (values: RequestResetValues) => {
    requestReset.mutate(values.email);
  };

  const message = requestReset.isSuccess ?
    t('auth.password.resetLinkSent', 'We\'ve emailed you a reset link – check your inbox!') :
    null;
  const submitError = requestReset.error?.message ?? null;
  const isSubmitting = requestReset.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
      <Card className="p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          {t('auth.forgotPassword', 'Forgot your password?')}
        </h2>

        {message ? (
          <p className="text-center text-xs sm:text-sm text-green-700 dark:text-green-400" role="status">{message}</p>
        ) : (
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

              {submitError && (
                <p role="alert" className="text-destructive text-sm">{submitError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading.general') : t('auth.password.sendResetLink', 'Send reset link')}
              </Button>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};
